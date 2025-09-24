from pydantic import BaseModel

class ChangeStatusUpdate(BaseModel):
    new_status: str
