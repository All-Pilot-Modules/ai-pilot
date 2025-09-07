from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional

class StudentEnrollmentCreate(BaseModel):
    student_id: str
    access_code: str

class StudentEnrollmentOut(BaseModel):
    id: UUID
    student_id: str
    module_id: UUID
    enrolled_at: datetime
    access_code_used: str
    
    class Config:
        from_attributes = True

class EnrollmentWithModuleInfo(BaseModel):
    id: UUID
    student_id: str
    module_id: UUID
    enrolled_at: datetime
    access_code_used: str
    module_name: str
    module_description: Optional[str]
    
    class Config:
        from_attributes = True