from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List
from uuid import UUID
from datetime import datetime

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

    # AI Generation and Review Workflow Fields
    status: Optional[str] = Field("active", description="Question status: unreviewed, active, or archived")
    is_ai_generated: Optional[bool] = Field(False, description="Whether this question was AI-generated")
    generated_at: Optional[datetime] = Field(None, description="Timestamp when question was AI-generated")

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
    status: Optional[str] = None

class QuestionOut(QuestionBase):
    id: UUID

    class Config:
        from_attributes = True


# AI Question Generation Schemas

class QuestionGenerationRequest(BaseModel):
    """Request schema for AI question generation"""
    num_short: int = Field(0, ge=0, le=50, description="Number of short answer questions to generate (0-50)")
    num_long: int = Field(0, ge=0, le=50, description="Number of long answer questions to generate (0-50)")
    num_mcq: int = Field(0, ge=0, le=50, description="Number of multiple choice questions to generate (0-50)")

    @validator('num_short', 'num_long', 'num_mcq')
    def validate_counts(cls, v):
        if v < 0:
            raise ValueError("Question count cannot be negative")
        if v > 50:
            raise ValueError("Cannot generate more than 50 questions of one type at a time")
        return v

    @validator('num_mcq')
    def validate_total(cls, v, values):
        total = values.get('num_short', 0) + values.get('num_long', 0) + v
        if total == 0:
            raise ValueError("Must request at least 1 question")
        if total > 100:
            raise ValueError("Cannot generate more than 100 total questions at a time")
        return v


class QuestionGenerationResponse(BaseModel):
    """Response schema after AI question generation"""
    generated_count: int = Field(..., description="Total number of questions generated")
    num_short: int = Field(..., description="Number of short answer questions generated")
    num_long: int = Field(..., description="Number of long answer questions generated")
    num_mcq: int = Field(..., description="Number of MCQ questions generated")
    document_id: UUID = Field(..., description="ID of the source document")
    module_id: UUID = Field(..., description="ID of the module")
    review_url: str = Field(..., description="URL to review the generated questions")
    message: str = Field(..., description="Success message")


class BulkApproveRequest(BaseModel):
    """Request schema for bulk approving questions"""
    question_ids: List[UUID] = Field(..., description="List of question IDs to approve")

    @validator('question_ids')
    def validate_ids(cls, v):
        if not v:
            raise ValueError("Must provide at least one question ID")
        if len(v) > 200:
            raise ValueError("Cannot approve more than 200 questions at once")
        return v


class BulkApproveResponse(BaseModel):
    """Response schema after bulk approving questions"""
    approved_count: int = Field(..., description="Number of questions successfully approved")
    failed_count: int = Field(0, description="Number of questions that failed to approve")
    message: str = Field(..., description="Success message")