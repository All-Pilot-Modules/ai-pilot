from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from uuid import UUID
from datetime import datetime


# Survey question structure
class SurveyQuestion(BaseModel):
    id: str = Field(..., description="Unique question ID (e.g., 'q1', 'q2')")
    question: str = Field(..., description="The question text")
    type: str = Field(..., description="Question type: 'short' or 'long'")
    required: bool = Field(default=False, description="Whether this question is required")
    placeholder: Optional[str] = Field(None, description="Placeholder text for the input")

    class Config:
        schema_extra = {
            "example": {
                "id": "q1",
                "question": "What did you find most helpful in this module?",
                "type": "long",
                "required": True,
                "placeholder": "Please share what aspects helped you learn effectively..."
            }
        }


# Module survey configuration (teacher edits this)
class ModuleSurveyConfig(BaseModel):
    survey_questions: List[SurveyQuestion] = Field(..., description="List of survey questions")
    survey_required: bool = Field(default=False, description="Whether survey is mandatory")

    class Config:
        schema_extra = {
            "example": {
                "survey_questions": [
                    {
                        "id": "q1",
                        "question": "What did you find most helpful?",
                        "type": "long",
                        "required": True,
                        "placeholder": "Your answer..."
                    }
                ],
                "survey_required": False
            }
        }


# Update module survey (teacher endpoint)
class ModuleSurveyUpdate(BaseModel):
    survey_questions: Optional[List[SurveyQuestion]] = Field(None, description="Updated survey questions")
    survey_required: Optional[bool] = Field(None, description="Updated required status")


# Student survey response creation
class SurveyResponseCreate(BaseModel):
    responses: Dict[str, str] = Field(..., description="Survey responses keyed by question ID")

    class Config:
        schema_extra = {
            "example": {
                "responses": {
                    "q1": "The AI feedback was very helpful",
                    "q2": "Some questions were too difficult",
                    "q3": "Overall great experience - 4/5"
                }
            }
        }


# Student survey response output
class SurveyResponseOut(BaseModel):
    id: UUID
    student_id: str
    module_id: UUID
    responses: Dict[str, str]
    submitted_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (previously orm_mode in v1)


# Combined survey data for student view
class StudentSurveyView(BaseModel):
    survey_questions: List[SurveyQuestion]
    survey_required: bool
    my_response: Optional[SurveyResponseOut] = None
    has_submitted: bool = False
