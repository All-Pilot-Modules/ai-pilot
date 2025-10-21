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
    waiver_status: Optional[int] = None
    consent_submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EnrollmentWithModuleInfo(BaseModel):
    id: UUID
    student_id: str
    module_id: UUID
    enrolled_at: datetime
    access_code_used: str
    waiver_status: Optional[int] = None
    consent_submitted_at: Optional[datetime] = None
    module_name: str
    module_description: Optional[str]

    class Config:
        from_attributes = True

class WaiverStatusUpdate(BaseModel):
    waiver_status: int  # 1=Agree, 2=Not agree, 3=Not eligible