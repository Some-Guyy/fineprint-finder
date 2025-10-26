# schemas/user_schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class Role(str, Enum):
    admin = "admin"
    user = "user"
    
class UserBase(BaseModel):
    username: str
    email: str
    role: Role
        
class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
    
class ResetPasswordRequest(BaseModel):
    new_password: str
    
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True
