from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class DocumentBase(BaseModel):
    title: str
    file_name: str
    file_hash: str
    file_type: str
    teacher_id: str
    module_id: UUID  # ✅ Changed from module_name to module_id
    storage_path: str
    index_path: Optional[str] = None
    slide_count: Optional[int] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentOut(DocumentBase):
    id: UUID
    uploaded_at: datetime

    class Config:
        orm_mode = True

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    file_name: Optional[str] = None
    file_hash: Optional[str] = None
    file_type: Optional[str] = None
    teacher_id: Optional[str] = None
    module_id: Optional[UUID] = None  # ✅ Updated to UUID
    storage_path: Optional[str] = None
    index_path: Optional[str] = None
    slide_count: Optional[int] = None