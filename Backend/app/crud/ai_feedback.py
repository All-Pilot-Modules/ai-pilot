from sqlalchemy.orm import Session
from app.models.ai_feedback import AIFeedback
from app.models.student_answer import StudentAnswer
from app.schemas.ai_feedback import AIFeedbackCreate
from typing import List, Optional
from uuid import UUID

def create_feedback(db: Session, feedback: AIFeedbackCreate) -> AIFeedback:
    """Create new AI feedback record"""
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"🔍 CRUD: create_feedback called for answer_id: {feedback.answer_id}")

    # Check if feedback already exists for this answer
    existing = db.query(AIFeedback).filter(AIFeedback.answer_id == feedback.answer_id).first()

    if existing:
        # Update existing feedback
        logger.info(f"📝 CRUD: Updating existing feedback with ID: {existing.id}")
        existing.is_correct = feedback.is_correct
        existing.score = feedback.score
        existing.feedback_data = feedback.feedback_data
        db.commit()
        db.refresh(existing)
        logger.info(f"✅ CRUD: Updated feedback ID: {existing.id}")
        return existing

    # Create new feedback
    logger.info(f"➕ CRUD: Creating new feedback record")
    db_feedback = AIFeedback(
        answer_id=feedback.answer_id,
        is_correct=feedback.is_correct,
        score=feedback.score,
        feedback_data=feedback.feedback_data
    )

    db.add(db_feedback)
    logger.info(f"💾 CRUD: Committing new feedback to database")
    db.commit()
    db.refresh(db_feedback)
    logger.info(f"✅ CRUD: Created new feedback with ID: {db_feedback.id}")
    return db_feedback

def get_feedback_by_answer(db: Session, answer_id: UUID) -> Optional[AIFeedback]:
    """Get feedback for a specific answer"""
    return db.query(AIFeedback).filter(AIFeedback.answer_id == answer_id).first()

def get_student_module_feedback(
    db: Session,
    student_id: str,
    module_id: UUID
) -> List[AIFeedback]:
    """Get all feedback for a student in a module"""
    return db.query(AIFeedback).join(
        StudentAnswer, AIFeedback.answer_id == StudentAnswer.id
    ).filter(
        StudentAnswer.student_id == student_id,
        StudentAnswer.module_id == module_id
    ).order_by(AIFeedback.generated_at.desc()).all()

def delete_feedback(db: Session, feedback_id: UUID) -> bool:
    """Delete feedback"""
    db_feedback = db.query(AIFeedback).filter(AIFeedback.id == feedback_id).first()
    if db_feedback:
        db.delete(db_feedback)
        db.commit()
        return True
    return False
