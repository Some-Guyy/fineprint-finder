from pydantic import BaseModel

class ChangeStatusUpdate(BaseModel):
    new_status: str

class ChangeCommentCreate(BaseModel):
    username: str
    comment: str

class ChangeDetailsUpdate(BaseModel):
    summary: str
    analysis: str
    change: str
    before_quote: str
    after_quote: str
    classification: str
