from fastapi import UploadFile, File, HTTPException, Body
from fastapi import APIRouter
from datetime import datetime
from pathlib import Path
from bson import ObjectId
import logging
import shutil

from db.mongo import regulation_collection, notification_collection
from schemas.regulations import ChangeStatusUpdate
from schemas.regulations import ChangeCommentCreate
from schemas.regulations import ChangeDetailsUpdate
from services.s3 import s3_client, s3_bucket

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

router = APIRouter()

@router.get("/regulations")
async def get_all_regulations():
    try:
        docs = []
        for doc in regulation_collection.find({}):
            doc["_id"] = str(doc["_id"])
            docs.append(doc)
        return docs
    except Exception as e:
        logging.exception("Failed to get all regulations")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/regulations")
async def create_regulation(title: str = Body(...), version: str = Body(...), file: UploadFile = File(...)):
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        temp_path = UPLOAD_DIR / file.filename
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        s3_key = f"{datetime.now().strftime('%Y-%m-%d_%H:%M:%S')}_{file.filename}"
        s3_client.upload_file(str(temp_path), s3_bucket, s3_key)

        doc = {
            "title": title,
            "status": "pending",
            "versions": [
                {
                    "id": "v1",
                    "version": version,
                    "uploadDate": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "s3Key": s3_key,
                    "detailedChanges": []
                }
            ],
            "comments": []
        }
        result = regulation_collection.insert_one(doc)
        
        return {"id": str(result.inserted_id), "message": "Regulation created"}
    
    except Exception as e:
        logging.exception("Failed to create regulation")
        raise HTTPException(status_code=500, detail=str(e))

# Change status of a change
@router.put("/regulations/{reg_id}/versions/{version_id}/changes/{change_id}")
async def update_change_status(reg_id: str, version_id: str, change_id: str, body: ChangeStatusUpdate):
    reg_doc = regulation_collection.find_one({"_id": ObjectId(reg_id)})

    if not reg_doc:
        raise HTTPException(status_code=404, detail="Regulation not found")
    
    # Find version by id
    version = next((v for v in reg_doc['versions'] if v['id'] == version_id), None)
    if not version:
        raise HTTPException(status_code=404, detail=f"Version {version_id} not found")

    # Find change by id
    change = next((c for c in version.get('detailedChanges', []) if c['id'] == change_id), None)
    if not change:
        raise HTTPException(status_code=404, detail=f"Change {change_id} not found")

    new_status = body.new_status

    # Update using array filters
    regulation_collection.update_one(
        {"_id": ObjectId(reg_id)},
        {
            "$set": {
                "versions.$[v].detailedChanges.$[c].status": new_status
            }
        },
        array_filters=[{"v.id": version_id}, {"c.id": change_id}]
    )

    return {"message": "Change status updated", "status": new_status}

# Delete regulation version
@router.delete("/regulations/{reg_id}/versions/{version_id}")
async def delete_regulation_version(reg_id: str, version_id: str):

    try:
        reg_doc = regulation_collection.find_one({"_id": ObjectId(reg_id)})
        if not reg_doc:
            raise HTTPException(status_code=404, detail="Regulation not found")
        
        version = next((v for v in reg_doc["versions"] if v["id"] == version_id), None)
        if not version:
            raise HTTPException(status_code=404, detail=f"Version {version_id} not found")

        # Delete from S3
        try:
            s3_client.delete_object(Bucket=s3_bucket, Key=version["s3Key"])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete from S3: {str(e)}")

        # Remove version from MongoDB
        regulation_collection.update_one(
            {"_id": ObjectId(reg_id)},
            {"$pull": {"versions": {"id": version_id}}}
        )

        return {"message": f"Version {version_id} deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Failed to delete version")
        raise HTTPException(status_code=500, detail=str(e))

# delete regulation
@router.delete("/regulations/{reg_id}")
async def delete_regulation(reg_id: str):
    try:
        reg_doc = regulation_collection.find_one({"_id": ObjectId(reg_id)})
        if not reg_doc:
            raise HTTPException(status_code=404, detail="Regulation not found")

        # Get all s3 keys to loop through and delete 
        s3_keys = [v["s3Key"] for v in reg_doc.get("versions", []) if "s3Key" in v]

        if s3_keys:
            try:
                s3_client.delete_objects(
                    Bucket=s3_bucket,
                    Delete={"Objects": [{"Key": key} for key in s3_keys]}
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to delete S3 objects: {str(e)}")

        # Remove regulation from MongoDB
        regulation_collection.delete_one({"_id": ObjectId(reg_id)})

        return {"message": f"Regulation '{reg_doc['title']}' and all its versions deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Failed to delete regulation")
        raise HTTPException(status_code=500, detail=str(e))

# add comments
@router.post("/regulations/{reg_id}/versions/{version_id}/changes/{change_id}/comments")
async def add_comment(reg_id: str, version_id: str, change_id: str, body: ChangeCommentCreate):
    reg_doc = regulation_collection.find_one({"_id": ObjectId(reg_id)})

    if not reg_doc:
        raise HTTPException(status_code=404, detail="Regulation not found")
    
    # Find version by id
    version = next((v for v in reg_doc['versions'] if v['id'] == version_id), None)
    if not version:
        raise HTTPException(status_code=404, detail=f"Version {version_id} not found")

    # Find change by id
    change = next((c for c in version.get('detailedChanges', []) if c['id'] == change_id), None)
    if not change:
        raise HTTPException(status_code=404, detail=f"Change {change_id} not found")
    
    new_comment = {
        "id": f"v{len(change['comments']) + 1}",
        "username": body.username,
        "comment": body.comment,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    try:
        regulation_collection.update_one(
            {"_id": ObjectId(reg_id)},
            {
                "$push": {
                    "versions.$[v].detailedChanges.$[c].comments": new_comment
                }
            },
            array_filters=[{"v.id": version_id}, {"c.id": change_id}]
        )

        return {"message": "Comment added", "comment": new_comment}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "details": "Failed to add new comment"
        })

# Update LLm analysis
@router.put("/regulations/{reg_id}/versions/{version_id}/changes/{change_id}/edit")
async def update_single_change(reg_id: str, version_id: str, change_id: str, body: ChangeDetailsUpdate):
    try:
        # Get regulation document
        reg_doc = regulation_collection.find_one({"_id": ObjectId(reg_id)})
        if not reg_doc:
            raise HTTPException(status_code=404, detail="Regulation not found")

        # Find version
        version = next((v for v in reg_doc["versions"] if v["id"] == version_id), None)
        if not version:
            raise HTTPException(status_code=404, detail=f"Version {version_id} not found")

        # Find the specific change
        change = next((c for c in version.get("detailedChanges", []) if c["id"] == change_id), None)
        if not change:
            raise HTTPException(status_code=404, detail=f"Change {change_id} not found")
        
        updates = body.model_dump(exclude_none=True)

        # Merge updates into existing change
        updated_change = {**change, **updates}
        updated_change["status"] = "pending"  # Reset status

        regulation_collection.update_one(
            {"_id": ObjectId(reg_id)},
            {
                "$set": {
                    "versions.$[v].detailedChanges.$[c]": updated_change,
                    "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            },
            array_filters=[{"v.id": version_id}, {"c.id": change_id}]
        )

        return {
            "message": f"Change {change_id} updated successfully and reset to pending",
            "updated_fields": updates,
            "status": "pending"
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Failed to update single change")
        raise HTTPException(status_code=500, detail=str(e))
