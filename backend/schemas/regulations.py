from pydantic import BaseModel
from typing import Optional

class ChangeStatusUpdate(BaseModel):
    new_status: str

class ChangeCommentCreate(BaseModel):
    username: str
    comment: str

class ChangeDetailsUpdate(BaseModel):
    summary: Optional[str] = None
    analysis: Optional[str] = None
    change: Optional[str] = None
    before_quote: Optional[str] = None
    after_quote: Optional[str] = None
    classification: Optional[str] = None
