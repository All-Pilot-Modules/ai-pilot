from sqlalchemy.orm import Session
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate
from uuid import UUID, uuid4
from typing import List, Optional

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