from pydantic import BaseModel

class ChangeStatusUpdate(BaseModel):
    new_status: str

class RegulationCommentCreate(BaseModel):
    username: str
    comment: str
