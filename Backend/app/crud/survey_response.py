from sqlalchemy.orm import Session
from app.models.survey_response import SurveyResponse
from app.schemas.survey import SurveyResponseCreate
from uuid import UUID
from typing import List, Optional
from datetime import datetime


# ✅ Get survey response by student and module
def get_survey_response(db: Session, student_id: str, module_id: UUID) -> Optional[SurveyResponse]:
    """Get a student's survey response for a specific module"""
    return db.query(SurveyResponse).filter(
        SurveyResponse.student_id == student_id,
        SurveyResponse.module_id == module_id
    ).first()


# ✅ Create survey response
def create_survey_response(
    db: Session,
    student_id: str,
    module_id: UUID,
    response_data: SurveyResponseCreate
) -> SurveyResponse:
    """Create a new survey response"""
    survey_response = SurveyResponse(
        student_id=student_id,
        module_id=module_id,
        responses=response_data.responses
    )
    db.add(survey_response)
    db.commit()
    db.refresh(survey_response)
    return survey_response


# ✅ Update survey response
def update_survey_response(
    db: Session,
    student_id: str,
    module_id: UUID,
    response_data: SurveyResponseCreate
) -> Optional[SurveyResponse]:
    """Update an existing survey response"""
    survey_response = get_survey_response(db, student_id, module_id)
    if not survey_response:
        return None

    survey_response.responses = response_data.responses
    survey_response.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(survey_response)
    return survey_response


# ✅ Create or update survey response (upsert)
def upsert_survey_response(
    db: Session,
    student_id: str,
    module_id: UUID,
    response_data: SurveyResponseCreate
) -> SurveyResponse:
    """Create or update survey response (upsert operation)"""
    existing = get_survey_response(db, student_id, module_id)
    if existing:
        return update_survey_response(db, student_id, module_id, response_data)
    else:
        return create_survey_response(db, student_id, module_id, response_data)


# ✅ Get all survey responses for a module (teacher view)
def get_module_survey_responses(db: Session, module_id: UUID) -> List[SurveyResponse]:
    """Get all student survey responses for a specific module"""
    return db.query(SurveyResponse).filter(
        SurveyResponse.module_id == module_id
    ).order_by(SurveyResponse.submitted_at.desc()).all()


# ✅ Delete survey response
def delete_survey_response(db: Session, student_id: str, module_id: UUID) -> bool:
    """Delete a survey response"""
    survey_response = get_survey_response(db, student_id, module_id)
    if not survey_response:
        return False

    db.delete(survey_response)
    db.commit()
    return True


# ✅ Check if student has submitted survey
def has_submitted_survey(db: Session, student_id: str, module_id: UUID) -> bool:
    """Check if a student has submitted a survey for a module"""
    return db.query(SurveyResponse).filter(
        SurveyResponse.student_id == student_id,
        SurveyResponse.module_id == module_id
    ).count() > 0
