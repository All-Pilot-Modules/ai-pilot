from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime
from uuid import UUID

class AIFeedbackCreate(BaseModel):
    """Schema for creating AI feedback"""
    answer_id: UUID
    is_correct: bool
    score: int = Field(ge=0, le=100)
    feedback_data: Dict[str, Any]  # Contains all feedback details

class AIFeedbackResponse(BaseModel):
    """Schema for returning AI feedback"""
    id: UUID
    answer_id: UUID
    is_correct: bool
    score: int
    feedback_data: Dict[str, Any]
    generated_at: datetime

    class Config:
        from_attributes = True
