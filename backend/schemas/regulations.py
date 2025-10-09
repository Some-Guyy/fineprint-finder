from pydantic import BaseModel

class ChangeStatusUpdate(BaseModel):
    new_status: str

class ChangeCommentCreate(BaseModel):
    username: str
    comment: str
