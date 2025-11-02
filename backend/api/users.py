# routes/user_routes.py
from fastapi import APIRouter, HTTPException, Body
from bson import ObjectId
import bcrypt
from db.mongo import user_collection
from schemas.users import UserCreate, UserLogin, UserResponse, UserUpdate, ResetPasswordRequest
from typing import List

router = APIRouter()

# hashing functions
def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

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
    
# get all accounts - admin route
@router.get("/users", response_model=List[UserResponse])
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


# create new account - admin route
@router.post("/create", response_model=UserResponse)
def create_account(payload: UserCreate):
    if user_collection.find_one({"username": payload.username}):
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = get_password_hash(payload.password)
    new_user = {
        "username": payload.username,
        "email": payload.email,
        "password": hashed_pw,
        "role": payload.role
    }
    result = user_collection.insert_one(new_user)

    return UserResponse(
        id=str(result.inserted_id),
        username=payload.username,
        email=payload.email,
        role=payload.role
    )

# edit user details - admin route
@router.put("/{user_id}", response_model=UserResponse)
def edit_user_details(user_id: str, payload: UserUpdate):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_fields = {}
    if payload.username:
        update_fields["username"] = payload.username
    if payload.email:
        update_fields["email"] = payload.email

    user_collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})

    updated_user = user_collection.find_one({"_id": ObjectId(user_id)})
    return UserResponse(
        id=str(updated_user["_id"]),
        username=updated_user["username"],
        email=updated_user["email"],
        role=updated_user["role"]
    )

# Reset password (admin)
@router.put("/{user_id}/reset-password")
def reset_password(user_id: str, payload: ResetPasswordRequest):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    hashed_pw = get_password_hash(payload.new_password)
    result = user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed_pw}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Password reset successfully"}

# Delete account (admin)
@router.delete("/{user_id}")
def delete_account(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = user_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}