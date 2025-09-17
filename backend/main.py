import os
import boto3
import shutil
from fastapi import FastAPI, Request, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from db.mongo import mongo_client, regulation_collection
from bson import ObjectId
from dotenv import load_dotenv
from llm.chains import analyze_pdfs
from datetime import datetime
from pathlib import Path
import logging

load_dotenv()

app = FastAPI()

# Add CORS BEFORE defining endpoints
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=["*"]
)

# s3 setup
s3 = boto3.client("s3")
bucket = os.getenv("S3_BUCKET", "fypwhere")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.on_event("startup")
def startup_db_client():
    try:
        mongo_client.admin.command("ping")
        print("MongoDB connection successful")
    except Exception as e:
        print("MongoDB connection failed:", e)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/regulations")
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

@app.post("/regulations")
async def create_regulation(title: str = Body(...), file: UploadFile = File(...)):
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        temp_path = UPLOAD_DIR / file.filename
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        s3_key = f"{datetime.now().strftime('%Y-%m-%d_%H:%M:%S')}_{file.filename}"
        s3.upload_file(str(temp_path), bucket, s3_key)

        doc = {
            "title": title,
            "status": "pending",
            "versions": [
                {
                    "id": "v1",
                    "version": "1.0",
                    "uploadDate": datetime.now().strftime("%Y-%m-%d"),
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
@app.post("/regulations/{reg_id}/versions")
async def add_regulation_version(reg_id: str, file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    temp_path = UPLOAD_DIR / file.filename
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    s3_key = f"{datetime.now().strftime('%Y-%m-%d_%H:%M:%S')}_{file.filename}"
    s3.upload_file(str(temp_path), bucket, s3_key)

    reg_doc = regulation_collection.find_one({"_id": ObjectId(reg_id)})
    if not reg_doc:
        raise HTTPException(status_code=404, detail="Regulation not found")

    before_key = reg_doc["versions"][-1]["s3Key"]

    detailed_changes = analyze_pdfs(before_key, s3_key)

    upload_date = datetime.now().strftime('%Y-%m-%d')

    new_version = {
        "id": f"v{len(reg_doc['versions']) + 1}",
        "version": f"{len(reg_doc['versions']) + 1}.0",
        "uploadDate": upload_date,
        "fileName": file.filename,
        "s3Key": s3_key,
        "detailedChanges": detailed_changes,
    }

    # Update Mongo
    regulation_collection.update_one(
        {"_id": ObjectId(reg_id)},
        {
            "$push": {"versions": new_version},
            "$set": {"lastUpdated": upload_date, "status": "pending"}
        }
    )

    return {"message": "New version added", "version": new_version}

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(request: Request, path_name: str):
    print("Unhandled route:", request.url.path)
    return PlainTextResponse("Route not found", status_code=404)
