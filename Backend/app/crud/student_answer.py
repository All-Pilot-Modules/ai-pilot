from sqlalchemy.orm import Session
from app.models.student_answer import StudentAnswer
from app.schemas.student_answer import StudentAnswerCreate, StudentAnswerUpdate
from uuid import UUID
from typing import List, Optional

# Create a student answer
def create_student_answer(db: Session, answer_data: StudentAnswerCreate) -> StudentAnswer:
    db_answer = StudentAnswer(**answer_data.dict())
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

# Get student answer by ID
def get_student_answer_by_id(db: Session, answer_id: UUID) -> Optional[StudentAnswer]:
    return db.query(StudentAnswer).filter(StudentAnswer.id == answer_id).first()

# Get all answers for a student in a document
def get_student_answers_by_document(db: Session, student_id: str, document_id: UUID, attempt: int = 1) -> List[StudentAnswer]:
    return db.query(StudentAnswer).filter(
        StudentAnswer.student_id == student_id,
        StudentAnswer.document_id == document_id,
        StudentAnswer.attempt == attempt
    ).all()

# Get specific student answer for a question and attempt
def get_student_answer(db: Session, student_id: str, question_id: UUID, attempt: int = 1) -> Optional[StudentAnswer]:
    return db.query(StudentAnswer).filter(
        StudentAnswer.student_id == student_id,
        StudentAnswer.question_id == question_id,
        StudentAnswer.attempt == attempt
    ).first()

# Update student answer
def update_student_answer(db: Session, answer_id: UUID, answer_data: StudentAnswerUpdate) -> Optional[StudentAnswer]:
    db_answer = get_student_answer_by_id(db, answer_id)
    if not db_answer:
        return None
    
    for key, value in answer_data.dict(exclude_unset=True).items():
        setattr(db_answer, key, value)
    
    db.commit()
    db.refresh(db_answer)
    return db_answer

# Delete student answer
def delete_student_answer(db: Session, answer_id: UUID) -> Optional[StudentAnswer]:
    db_answer = get_student_answer_by_id(db, answer_id)
    if not db_answer:
        return None
    
    db.delete(db_answer)
    db.commit()
    return db_answer

# Check if student has completed an attempt for a document
def has_completed_attempt(db: Session, student_id: str, document_id: UUID, attempt: int = 1) -> bool:
    from app.models.question import Question
    
    # Get total questions in document
    total_questions = db.query(Question).filter(Question.document_id == document_id).count()
    
    # Get answered questions for this attempt
    answered_questions = db.query(StudentAnswer).filter(
        StudentAnswer.student_id == student_id,
        StudentAnswer.document_id == document_id,
        StudentAnswer.attempt == attempt
    ).count()
    
    return answered_questions >= total_questions

# Get student's progress for a document
def get_student_progress(db: Session, student_id: str, document_id: UUID, attempt: int = 1) -> dict:
    from app.models.question import Question
    
    # Get total questions in document
    total_questions = db.query(Question).filter(Question.document_id == document_id).count()
    
    # Get answered questions for this attempt
    answered_questions = db.query(StudentAnswer).filter(
        StudentAnswer.student_id == student_id,
        StudentAnswer.document_id == document_id,
        StudentAnswer.attempt == attempt
    ).count()
    
    return {
        "total_questions": total_questions,
        "answered_questions": answered_questions,
        "completion_percentage": (answered_questions / total_questions * 100) if total_questions > 0 else 0,
        "is_complete": answered_questions >= total_questions
    }

# Get student's progress for all questions in a module
def get_student_progress_by_module(db: Session, student_id: str, module_id: UUID, attempt: int = 1) -> dict:
    from app.models.question import Question

    # Get total questions in this module (direct relationship)
    total_questions = db.query(Question).filter(Question.module_id == module_id).count()

    # Get answered questions for this attempt in the module
    answered_questions = db.query(StudentAnswer).filter(
        StudentAnswer.student_id == student_id,
        StudentAnswer.module_id == module_id,
        StudentAnswer.attempt == attempt
    ).count()

    return {
        "total_questions": total_questions,
        "answered_questions": answered_questions,
        "completion_percentage": (answered_questions / total_questions * 100) if total_questions > 0 else 0,
        "is_complete": answered_questions >= total_questions
    }

# Get all student answers for a module (teacher function)
def get_student_answers_by_module(db: Session, module_id: UUID) -> List[dict]:
    from app.models.question import Question

    # Join with Question to get question text, options, and correct answer (direct module relationship)
    results = db.query(
        StudentAnswer,
        Question.text,
        Question.options,
        Question.correct_answer,
        Question.correct_option_id
    ).join(Question, StudentAnswer.question_id == Question.id).filter(
        StudentAnswer.module_id == module_id
    ).all()

    # Convert to list of dictionaries with question_text, options, and correct answer included
    answer_list = []
    for answer, question_text, question_options, correct_answer, correct_option_id in results:
        answer_dict = {
            "id": answer.id,
            "student_id": answer.student_id,
            "question_id": answer.question_id,
            "module_id": answer.module_id,
            "document_id": answer.document_id,
            "answer": answer.answer,
            "attempt": answer.attempt,
            "submitted_at": answer.submitted_at,
            "question_text": question_text,
            "question_options": question_options,
            "correct_answer": correct_answer,
            "correct_option_id": correct_option_id
        }
        answer_list.append(answer_dict)

    return answer_list

# Delete all answers for a student in a specific module (teacher function)
def delete_student_assignment(db: Session, student_id: str, module_id: UUID) -> int:
    # Get all answers for this student in this module (direct relationship)
    answers = db.query(StudentAnswer).filter(
        StudentAnswer.student_id == student_id,
        StudentAnswer.module_id == module_id
    ).all()

    # Delete all answers
    count = 0
    for answer in answers:
        db.delete(answer)
        count += 1

    db.commit()
    return count