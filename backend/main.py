import os
import shutil
from fastapi import FastAPI, Request, UploadFile, File, HTTPException, Body
from fastapi.responses import JSONResponse, PlainTextResponse
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime
from pathlib import Path

load_dotenv()
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")

app = FastAPI()
URI = f"mongodb+srv://{db_user}:{db_pass}@fypwhere.u27axc2.mongodb.net/?retryWrites=true&w=majority&appName=fypwhere"
client = MongoClient(URI)
db = client["fypwhere"]
collection = db["regulations"]

@app.on_event("startup")
def startup_db_client():
    try:
        client.admin.command("ping")
        print("MongoDB connection successful")
    except Exception as e:
        print("MongoDB connection failed:", e)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "content_type": file.content_type, "location": str(file_path)}


@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(request: Request, path_name: str):
    print("Unhandled route:", request.url.path)
    return PlainTextResponse("Route not found", status_code=404)
