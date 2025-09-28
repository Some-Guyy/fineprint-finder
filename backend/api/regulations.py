from fastapi import UploadFile, File, HTTPException, Body
from fastapi import APIRouter
from datetime import datetime
from pathlib import Path
from bson import ObjectId
import logging
import shutil

from db.mongo import regulation_collection
from llm.chains import analyze_pdfs
from schemas.regulations import ChangeStatusUpdate
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
                    "detailedChanges": [],
                    "explanation": ""
                }
            ],
            "comments": []
        }
        result = regulation_collection.insert_one(doc)
        return {"id": str(result.inserted_id), "message": "Regulation created"}
    except Exception as e:
        logging.exception("Failed to create regulation")
        raise HTTPException(status_code=500, detail=str(e))

# Upload another PDF to update the regulation
@router.post("/regulations/{reg_id}/versions")
async def add_regulation_version(reg_id: str, version: str = Body(...), file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    temp_path = UPLOAD_DIR / file.filename
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    s3_key = f"{datetime.now().strftime('%Y-%m-%d_%H:%M:%S')}_{file.filename}"
    s3_client.upload_file(str(temp_path), s3_bucket, s3_key)

    reg_doc = regulation_collection.find_one({"_id": ObjectId(reg_id)})
    if not reg_doc:
        raise HTTPException(status_code=404, detail="Regulation not found")

    before_key = reg_doc["versions"][-1]["s3Key"]

    detailed_changes = analyze_pdfs(before_key, s3_key)
    
    if not isinstance(detailed_changes, list):
        raise HTTPException(
            status_code=500,
            detail={
                "error": detailed_changes,
                "details": "Analysis failed"
            }
    )

    upload_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    new_version = {
        "id": f"v{len(reg_doc['versions']) + 1}",
        "version": version,
        "uploadDate": upload_date,
        "fileName": file.filename,
        "s3Key": s3_key,
        "detailedChanges": detailed_changes,
    }

    # Update Mongo
    try:
        regulation_collection.update_one(
            {"_id": ObjectId(reg_id)},
            {
                "$push": {"versions": new_version},
                "$set": {"lastUpdated": upload_date, "status": "pending"}
            }
        )

        return {"message": "New version added", "version": new_version}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "details": "Failed to add new version"
        })

# Change status of a change
@router.put("/regulations/{reg_id}/versions/{version_id}/changes/{change_id}")
async def update_change_status(
    reg_id: str,
    version_id: str,
    change_id: str,
    body: ChangeStatusUpdate
):
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
