# routes/user_routes.py
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
import bcrypt
from db.mongo import user_collection
from schemas.users import UserCreate, UserLogin, UserResponse
from typing import List

router = APIRouter()

# hashing functions
def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# get all accounts - admin route
@router.get("/", response_model=List[UserResponse])
def fetch_all_accounts():
    users = list(user_collection.find({}, {"password": 0}))
    return [
        UserResponse(
            id=str(u["_id"]),
            username=u["username"],
            email=u["email"],
            role=u["role"]
        ) for u in users
    ]

# login
@router.post("/login")
def login(credentials: UserLogin):
    user = user_collection.find_one({"username": credentials.username})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {
        "message": "Login successful",
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }


