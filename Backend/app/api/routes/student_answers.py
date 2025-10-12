from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.schemas.student_answer import StudentAnswerCreate, StudentAnswerOut, StudentAnswerUpdate
from app.crud.student_answer import (
    create_student_answer,
    get_student_answer_by_id,
    get_student_answers_by_module,
    update_student_answer,
    delete_student_answer,
    delete_student_assignment,
    get_student_answers_by_document,
    get_student_answer
)
from app.database import get_db

router = APIRouter()

# Get all student answers with optional module filtering
@router.get("/", response_model=List[dict])
def get_all_student_answers(
    module_id: Optional[UUID] = Query(None, description="Filter by module ID"),
    student_id: Optional[str] = Query(None, description="Filter by student ID"),
    db: Session = Depends(get_db)
):
    """
    Get all student answers, optionally filtered by module or student
    """
    try:
        if module_id:
            # Get answers for specific module
            answers = get_student_answers_by_module(db, module_id)
            return answers
        else:
            # Get all answers (you might want to add pagination here)
            from app.models.student_answer import StudentAnswer
            from app.models.question import Question
            
            query = db.query(
                StudentAnswer,
                Question.text,
                Question.options,
                Question.correct_answer
            ).join(Question, StudentAnswer.question_id == Question.id)
            
            if student_id:
                query = query.filter(StudentAnswer.student_id == student_id)
            
            results = query.all()
            
            # Convert to list of dictionaries with question_text, options, and correct answer included
            answer_list = []
            for answer, question_text, question_options, correct_answer in results:
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
                    "correct_answer": correct_answer
                }
                answer_list.append(answer_dict)
            
            return answer_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch student answers: {str(e)}")

# Get specific student answer by ID
@router.get("/{answer_id}", response_model=StudentAnswerOut)
def get_student_answer_by_id_route(
    answer_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific student answer by ID
    """
    answer = get_student_answer_by_id(db, answer_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Student answer not found")
    return answer

# Create new student answer
@router.post("/", response_model=StudentAnswerOut)
def create_new_student_answer(
    answer_data: StudentAnswerCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new student answer
    """
    try:
        # Check if answer already exists for this attempt
        existing_answer = get_student_answer(
            db, answer_data.student_id, answer_data.question_id, answer_data.attempt
        )
        
        if existing_answer:
            # Update existing answer
            update_data = StudentAnswerUpdate(answer=answer_data.answer)
            updated_answer = update_student_answer(db, existing_answer.id, update_data)
            return updated_answer
        else:
            # Create new answer
            return create_student_answer(db, answer_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create student answer: {str(e)}")

# Update student answer
@router.put("/{answer_id}", response_model=StudentAnswerOut)
def update_student_answer_route(
    answer_id: UUID,
    answer_data: StudentAnswerUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a student answer
    """
    try:
        updated_answer = update_student_answer(db, answer_id, answer_data)
        if not updated_answer:
            raise HTTPException(status_code=404, detail="Student answer not found")
        return updated_answer
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update student answer: {str(e)}")

# Delete specific student answer
@router.delete("/{answer_id}")
def delete_student_answer_route(
    answer_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Delete a specific student answer
    """
    try:
        deleted_answer = delete_student_answer(db, answer_id)
        if not deleted_answer:
            raise HTTPException(status_code=404, detail="Student answer not found")
        return {"detail": "Student answer deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete student answer: {str(e)}")

# Delete all answers for a student in a module (delete student assignment)
@router.delete("/modules/{module_id}/students/{student_id}")
def delete_student_assignment_route(
    module_id: UUID,
    student_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete all answers for a student in a specific module
    """
    try:
        deleted_count = delete_student_assignment(db, student_id, module_id)
        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="No answers found for this student in this module")
        return {"detail": f"Successfully deleted {deleted_count} answers for student {student_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete student assignment: {str(e)}")

# Get student answers for a specific document
@router.get("/documents/{document_id}")
def get_student_answers_by_document_route(
    document_id: UUID,
    student_id: Optional[str] = Query(None, description="Filter by student ID"),
    attempt: int = Query(1, description="Attempt number", ge=1, le=2),
    db: Session = Depends(get_db)
):
    """
    Get student answers for a specific document
    """
    try:
        if student_id:
            answers = get_student_answers_by_document(db, student_id, document_id, attempt)
        else:
            # Get all answers for this document
            from app.models.student_answer import StudentAnswer
            answers = db.query(StudentAnswer).filter(
                StudentAnswer.document_id == document_id,
                StudentAnswer.attempt == attempt
            ).all()
        
        return answers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch student answers: {str(e)}")
    
    
    



    
    
