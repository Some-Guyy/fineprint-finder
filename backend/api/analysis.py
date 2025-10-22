from fastapi import UploadFile, File, HTTPException, Body
from fastapi import APIRouter
from datetime import datetime
from pathlib import Path
from bson import ObjectId
import shutil

from db.mongo import regulation_collection, notification_collection
from llm.chains import analyze_pdfs
from services.s3 import s3_client, s3_bucket

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

router = APIRouter()

# Upload another PDF to update the regulation
@router.post("/regulations/{reg_id}/versions")
async def add_regulation_version(reg_id: str, version: str = Body(...), file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    temp_path = UPLOAD_DIR / file.filename
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    reg_doc = regulation_collection.find_one({"_id": ObjectId(reg_id)})
    if not reg_doc:
        raise HTTPException(status_code=404, detail="Regulation not found")

    before_key = reg_doc["versions"][-1]["s3Key"]

    try:
        detailed_changes = analyze_pdfs(before_key, temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    # upload to s3 & mongo only if the analysis is successful
    try:
        s3_key = f"{datetime.now().strftime('%Y-%m-%d_%H:%M:%S')}_{file.filename}"
        s3_client.upload_file(str(temp_path), s3_bucket, s3_key)
        upload_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        new_version = {
            "id": f"v{len(reg_doc['versions']) + 1}",
            "version": version,
            "uploadDate": upload_date,
            "fileName": file.filename,
            "s3Key": s3_key,
            "detailedChanges": detailed_changes,
        }

        regulation_collection.update_one(
            {"_id": ObjectId(reg_id)},
            {
                "$push": { "versions": new_version}, 
                "$set": {"lastUpdated": upload_date, "status": "pending"}
            },
        )
        
        notif = {
            "title": f"New Version Added: {reg_doc['title']}",
            "message": f"A new version ({version}) has been added to the regulation '{reg_doc['title']}'.",
            "created_at": datetime.now(),
            "seen_by": []
        }
        notification_collection.insert_one(notif)

        return {"message": "Version added successfully", "version": new_version}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 upload or DB update failed: {e}")

    finally:
        if temp_path.exists():
            temp_path.unlink()
