from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime

class StudentAnswerBase(BaseModel):
    student_id: str = Field(..., description="Student user ID")
    question_id: UUID = Field(..., description="Question ID being answered")
    document_id: UUID = Field(..., description="Document ID containing the question")
    answer: Dict[str, Any] = Field(..., description="Student's answer - supports MCQ selection + text explanation")
    attempt: int = Field(..., description="Attempt number (1 or 2)", ge=1, le=2)

class StudentAnswerCreate(StudentAnswerBase):
    pass

class StudentAnswerUpdate(BaseModel):
    answer: Optional[Dict[str, Any]] = None

class StudentAnswerOut(StudentAnswerBase):
    id: UUID
    submitted_at: datetime

    class Config:
        orm_mode = True