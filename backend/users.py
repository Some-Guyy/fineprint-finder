from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api.users import router as user_router
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
        print("MongoDB connection successful from users service")
    except Exception as e:
        print("MongoDB connection failed from users service:", e)

app.include_router(user_router)
app.include_router(utils_router)
