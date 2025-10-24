from pydantic import BaseModel, Field
from typing import Optional, Dict
from uuid import UUID

class QuestionBase(BaseModel):
    module_id: UUID = Field(..., description="ID of the related module")
    document_id: Optional[UUID] = Field(None, description="Optional ID of the source document")
    type: str = Field(..., description="Question type: mcq, short, or long")
    text: str = Field(..., description="Question text")
    slide_number: Optional[int] = Field(None, description="If from slides, optional slide number")
    question_order: Optional[int] = Field(None, description="Order/position of question in the module")
    options: Optional[Dict[str, str]] = Field(None, description="Only for MCQs, e.g., {'A': 'Apple', 'B': 'Ball'}")
    correct_answer: Optional[str] = Field(None, description="Legacy: Correct answer text (for short/long questions)")
    correct_option_id: Optional[str] = Field(None, description="For MCQs: Correct option ID (A, B, C, or D)")
    learning_outcome: Optional[str] = Field(None, description="Outcome target if defined")
    bloom_taxonomy: Optional[str] = Field(None, description="Bloom's level like Remember, Analyze, etc.")
    image_url: Optional[str] = Field(None, description="URL to image if the question is visual")
    has_text_input: Optional[bool] = Field(False, description="True if it includes explanation input")

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    type: Optional[str] = None
    slide_number: Optional[int] = None
    question_order: Optional[int] = None
    options: Optional[Dict[str, str]] = None
    correct_answer: Optional[str] = None
    correct_option_id: Optional[str] = None
    learning_outcome: Optional[str] = None
    bloom_taxonomy: Optional[str] = None
    image_url: Optional[str] = None
    has_text_input: Optional[bool] = None
    document_id: Optional[UUID] = None

class QuestionOut(QuestionBase):
    id: UUID

    class Config:
        from_attributes = True