from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api.regulations import router as regulations_router
from api.utils import router as utils_router
from db.mongo import mongo_client

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

@app.on_event("startup")
def startup_db_client():
    try:
        mongo_client.admin.command("ping")
        print("MongoDB connection successful")
    except Exception as e:
        print("MongoDB connection failed:", e)

app.include_router(regulations_router)
app.include_router(utils_router)
