"""
Pydantic schemas for AI feedback responses
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class AIFeedbackResponse(BaseModel):
    """Schema for AI-generated feedback on student answers"""

    # Core feedback data
    feedback_id: str = Field(..., description="Unique identifier for this feedback")
    question_id: str = Field(..., description="Question being answered")
    is_correct: bool = Field(..., description="Whether the answer is correct")
    correctness_score: float = Field(..., ge=0, le=100, description="Score from 0-100")

    # Feedback content
    explanation: str = Field(..., description="Explanation of the answer correctness")
    improvement_hint: str = Field(..., description="Guidance for improvement")
    concept_explanation: str = Field(..., description="Explanation of key concepts")
    confidence_level: str = Field(..., description="AI confidence: high/medium/low")

    # Detailed feedback (for text answers)
    strengths: Optional[List[str]] = Field(default=None, description="What the student did well")
    weaknesses: Optional[List[str]] = Field(default=None, description="Areas for improvement")
    missing_concepts: Optional[List[str]] = Field(default=None, description="Important concepts not addressed")

    # RAG-enhanced feedback
    rag_sources: Optional[List[str]] = Field(default=None, description="Source documents used for context")
    rag_context_summary: Optional[str] = Field(default=None, description="Summary of RAG context used")
    used_rag: bool = Field(default=False, description="Whether RAG context was used")

    # MCQ-specific fields
    selected_option: Optional[str] = Field(default=None, description="Student's selected option (MCQ)")
    correct_option: Optional[str] = Field(default=None, description="Correct option (MCQ)")
    available_options: Optional[Dict[str, str]] = Field(default=None, description="All options (MCQ)")

    # Text answer specific
    answer_length: Optional[int] = Field(default=None, description="Length of student answer")
    reference_answer: Optional[str] = Field(default=None, description="Reference/expected answer")

    # Metadata
    feedback_type: str = Field(..., description="Type: mcq, short, essay")
    attempt_number: int = Field(..., description="Attempt number (1 or 2)")
    model_used: str = Field(..., description="AI model used for generation")
    generated_at: str = Field(..., description="Timestamp of generation")

    # Error handling
    fallback: Optional[bool] = Field(default=False, description="Whether fallback feedback was used")
    error: Optional[bool] = Field(default=False, description="Whether an error occurred")
    message: Optional[str] = Field(default=None, description="Error message if any")

    class Config:
        json_schema_extra = {
            "example": {
                "feedback_id": "123e4567-e89b-12d3-a456-426614174000",
                "question_id": "123e4567-e89b-12d3-a456-426614174001",
                "is_correct": False,
                "correctness_score": 45.0,
                "explanation": "Your answer is partially correct. You identified the main concept but missed some key details.",
                "improvement_hint": "Review the power rule for derivatives and practice with more examples.",
                "concept_explanation": "The power rule states that d/dx[x^n] = n*x^(n-1).",
                "confidence_level": "high",
                "strengths": ["Correct approach", "Good notation"],
                "weaknesses": ["Missed the constant term", "Calculation error"],
                "missing_concepts": ["Chain rule application"],
                "rag_sources": ["Calculus_Chapter3.pdf", "Derivatives_Notes.pdf"],
                "rag_context_summary": "Retrieved from: Calculus_Chapter3.pdf, Derivatives_Notes.pdf",
                "used_rag": True,
                "feedback_type": "short",
                "attempt_number": 1,
                "model_used": "gpt-4",
                "generated_at": "2025-01-15T10:30:00Z",
                "fallback": False,
                "error": False
            }
        }


class FeedbackGenerationRequest(BaseModel):
    """Request schema for generating feedback"""

    answer_id: str = Field(..., description="ID of the student answer to generate feedback for")
    force_regenerate: bool = Field(default=False, description="Force regeneration even if feedback exists")

    class Config:
        json_schema_extra = {
            "example": {
                "answer_id": "123e4567-e89b-12d3-a456-426614174000",
                "force_regenerate": False
            }
        }


class FeedbackSummary(BaseModel):
    """Summary of feedback for display in lists"""

    feedback_id: str
    question_id: str
    is_correct: bool
    correctness_score: float
    feedback_type: str
    used_rag: bool
    generated_at: str

    class Config:
        json_schema_extra = {
            "example": {
                "feedback_id": "123e4567-e89b-12d3-a456-426614174000",
                "question_id": "123e4567-e89b-12d3-a456-426614174001",
                "is_correct": True,
                "correctness_score": 95.0,
                "feedback_type": "mcq",
                "used_rag": True,
                "generated_at": "2025-01-15T10:30:00Z"
            }
        }
