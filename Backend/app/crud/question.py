from sqlalchemy.orm import Session
from app.models.question import Question, QuestionStatus
from app.schemas.question import QuestionCreate, QuestionUpdate
from uuid import UUID, uuid4
from typing import List, Optional, Dict, Any

# ✅ Create a single question
def create_question(db: Session, question_data: QuestionCreate) -> Question:
    try:
        # Convert Pydantic model to dict
        question_dict = question_data.dict()

        # Auto-assign question_order if not provided
        if question_dict.get('question_order') is None:
            # Get the max question_order for this module and add 1
            max_order = db.query(Question.question_order).filter(
                Question.module_id == question_dict['module_id']
            ).order_by(Question.question_order.desc()).first()

            if max_order and max_order[0] is not None:
                question_dict['question_order'] = max_order[0] + 1
            else:
                question_dict['question_order'] = 1

        # Create new question with explicit ID
        new_q = Question(
            id=uuid4(),
            **question_dict
        )

        db.add(new_q)
        db.commit()
        db.refresh(new_q)
        return new_q
    except Exception as e:
        db.rollback()
        print(f"❌ Database error in create_question: {str(e)}")
        raise

# ✅ Bulk insert questions (used for testbank uploads)
def bulk_create_questions(db: Session, questions: List[QuestionCreate]) -> List[Question]:
    objs = [Question(id=uuid4(), **q.dict()) for q in questions]
    db.add_all(objs)
    db.commit()
    return objs

# ✅ Get all questions from a specific document
def get_questions_by_document_id(db: Session, document_id: UUID) -> List[Question]:
    return db.query(Question).filter(Question.document_id == document_id).all()

# ✅ Get all questions from a specific module (direct relationship)
def get_questions_by_module_id(db: Session, module_id: UUID) -> List[Question]:
    return db.query(Question).filter(Question.module_id == module_id).order_by(Question.question_order.nulls_last(), Question.id).all()

# ✅ Get a single question by ID
def get_question_by_id(db: Session, question_id: UUID) -> Optional[Question]:
    return db.query(Question).filter(Question.id == question_id).first()

# ✅ Update question
def update_question(db: Session, question_id: UUID, data: QuestionUpdate) -> Optional[Question]:
    q = get_question_by_id(db, question_id)
    if not q:
        return None
    for key, value in data.dict(exclude_unset=True).items():
        setattr(q, key, value)
    db.commit()
    db.refresh(q)
    return q

# ✅ Delete question
def delete_question(db: Session, question_id: UUID) -> Optional[Question]:
    q = get_question_by_id(db, question_id)
    if not q:
        return None
    db.delete(q)
    db.commit()
    return q


# ✅ Get questions by status
def get_questions_by_status(db: Session, module_id: UUID, status: str) -> List[Question]:
    """
    Get all questions for a module filtered by status

    Args:
        db: Database session
        module_id: UUID of the module
        status: Question status (unreviewed, active, archived)

    Returns:
        List of questions matching the status filter
    """
    return (
        db.query(Question)
        .filter(Question.module_id == module_id, Question.status == status)
        .order_by(Question.question_order.nulls_last(), Question.id)
        .all()
    )


# ✅ Approve a single question
def approve_question(db: Session, question_id: UUID) -> Optional[Question]:
    """
    Approve a question by changing its status from 'unreviewed' to 'active'

    Args:
        db: Database session
        question_id: UUID of the question to approve

    Returns:
        Updated question with status='active', or None if not found
    """
    question = get_question_by_id(db, question_id)
    if not question:
        return None

    question.status = QuestionStatus.ACTIVE
    db.commit()
    db.refresh(question)
    return question


# ✅ Bulk approve multiple questions
def bulk_approve_questions(db: Session, question_ids: List[UUID]) -> Dict[str, Any]:
    """
    Approve multiple questions at once by changing their status to 'active'

    Args:
        db: Database session
        question_ids: List of question UUIDs to approve

    Returns:
        Dict with approved_count and failed_count
    """
    approved_count = 0
    failed_count = 0

    for question_id in question_ids:
        try:
            question = get_question_by_id(db, question_id)
            if question:
                question.status = QuestionStatus.ACTIVE
                approved_count += 1
            else:
                failed_count += 1
        except Exception as e:
            print(f"Error approving question {question_id}: {str(e)}")
            failed_count += 1

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error committing bulk approve: {str(e)}")
        raise

    return {
        "approved_count": approved_count,
        "failed_count": failed_count
    }