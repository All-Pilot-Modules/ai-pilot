from pydantic import BaseModel, Field
from typing import Optional, Dict
from uuid import UUID

class QuestionBase(BaseModel):
    document_id: UUID = Field(..., description="ID of the related document")
    type: str = Field(..., description="Question type: mcq, short, or long")
    text: str = Field(..., description="Question text")
    slide_number: Optional[int] = Field(None, description="If from slides, optional slide number")
    options: Optional[Dict[str, str]] = Field(None, description="Only for MCQs, e.g., {'A': 'Option A'}")
    correct_answer: Optional[str] = Field(None, description="Correct answer key or text")
    learning_outcome: Optional[str] = Field(None, description="Outcome target if defined")
    bloom_taxonomy: Optional[str] = Field(None, description="Bloom’s level like Remember, Analyze, etc.")
    image_url: Optional[str] = Field(None, description="URL to image if the question is visual")
    has_text_input: Optional[bool] = Field(False, description="True if it includes explanation input")

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    type: Optional[str] = None
    slide_number: Optional[int] = None
    options: Optional[Dict[str, str]] = None
    correct_answer: Optional[str] = None
    learning_outcome: Optional[str] = None
    bloom_taxonomy: Optional[str] = None
    image_url: Optional[str] = None
    has_text_input: Optional[bool] = None

class QuestionOut(QuestionBase):
    id: UUID

    class Config:
        orm_mode = True