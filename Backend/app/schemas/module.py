from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ModuleBase(BaseModel):
    teacher_id: str
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True
    due_date: Optional[datetime] = None
    visibility: Optional[str] = "class-only"  # can be 'class-only' or 'public'
    slug: Optional[str] = None
    instructions: Optional[str] = None

class ModuleCreate(ModuleBase):
    pass

class ModuleOut(ModuleBase):
    id: UUID
    access_code: str
    created_at: datetime

    class Config:
        orm_mode = True