from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.schemas.student_answer import StudentAnswerCreate, StudentAnswerOut, StudentAnswerUpdate
from app.schemas.module import ModuleOut
from app.schemas.document import DocumentOut
from app.schemas.question import QuestionOut
from app.crud.student_answer import (
    create_student_answer,
    get_student_answer,
    get_student_answers_by_document,
    update_student_answer,
    delete_student_answer,
    get_student_progress,
    has_completed_attempt
)
from app.crud.module import get_module_by_access_code, get_module_by_id
from app.models.module import Module
from app.crud.document import get_documents_by_module, get_documents_by_module_for_students
from app.crud.question import get_questions_by_module_id
from app.database import get_db

router = APIRouter()

# 🔍 Join module with access code
@router.post("/join-module", response_model=ModuleOut)
def join_module_with_code(
    access_code: str = Query(..., description="Module access code"),
    db: Session = Depends(get_db)
):
    """
    Allow students to join a module using access code
    """
    print(f"🔍 Searching for access code: '{access_code}' (length: {len(access_code)})")
    
    # Debug: Check all modules and their access codes
    all_modules = db.query(Module).all()
    print(f"📊 Total modules in database: {len(all_modules)}")
    for i, mod in enumerate(all_modules[:5]):  # Show first 5 modules
        print(f"  Module {i+1}: name='{mod.name}', access_code='{mod.access_code}', active={mod.is_active}")
    
    # Try exact match first
    module = get_module_by_access_code(db, access_code.strip())
    if not module:
        # Try uppercase match
        module = get_module_by_access_code(db, access_code.strip().upper())
        if not module:
            # Try case-insensitive search
            module = db.query(Module).filter(Module.access_code.ilike(access_code.strip())).first()
            if not module:
                print(f"❌ No module found with access code: '{access_code}'")
                raise HTTPException(status_code=404, detail="Invalid access code")
    
    print(f"✅ Found module: '{module.name}' with access code: '{module.access_code}'")
    
    if not module.is_active:
        raise HTTPException(status_code=400, detail="Module is not active")
    
    return module

# 📄 Get all documents in a module (for assignments)
@router.get("/modules/{module_id}/documents", response_model=List[DocumentOut])
def get_module_documents(
    module_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get all non-testbank documents in a module (supporting materials only)
    """
    module = get_module_by_id(db, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Get documents but exclude test banks for student safety
    documents = get_documents_by_module_for_students(db, module_id)
    return documents

# ❓ Get all questions for a module (the assignment)
@router.get("/modules/{module_id}/questions", response_model=List[QuestionOut])
def get_module_questions(
    module_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get all questions for a module (this is the assignment)
    """
    module = get_module_by_id(db, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    questions = get_questions_by_module_id(db, module_id)
    return questions

# ❓ Get all questions for a document (assignment)
@router.get("/documents/{document_id}/questions", response_model=List[QuestionOut])
def get_assignment_questions(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get all questions for a specific document/assignment
    """
    from app.crud.document import get_document_by_id
    from app.crud.question import get_questions_by_document_id
    
    document = get_document_by_id(db, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    questions = get_questions_by_document_id(db, document_id)
    return questions

# ✅ Submit answer for a question with instant AI feedback
@router.post("/submit-answer")
def submit_student_answer(
    answer_data: StudentAnswerCreate,
    db: Session = Depends(get_db)
):
    """
    Submit student answer for a question with instant AI feedback on first attempt
    """
    from app.services.ai_feedback import AIFeedbackService
    from app.crud.question import get_question_by_id
    
    # Check if answer already exists for this attempt
    existing_answer = get_student_answer(
        db, answer_data.student_id, answer_data.question_id, answer_data.attempt
    )
    
    if existing_answer:
        # Update existing answer
        update_data = StudentAnswerUpdate(answer=answer_data.answer)
        updated_answer = update_student_answer(db, existing_answer.id, update_data)
        created_answer = updated_answer
    else:
        # Create new answer
        created_answer = create_student_answer(db, answer_data)
    
    # Generate instant AI feedback for first attempt
    if answer_data.attempt == 1:
        try:
            # Get question to find module_id
            question = get_question_by_id(db, str(answer_data.question_id))
            if question and question.document:
                module_id = str(question.document.module_id)
                
                # Generate AI feedback
                feedback_service = AIFeedbackService()
                feedback = feedback_service.generate_instant_feedback(
                    db=db,
                    student_answer=created_answer,
                    question_id=str(answer_data.question_id),
                    module_id=module_id
                )
                
                # Return enhanced response with feedback
                return {
                    "success": True,
                    "answer": {
                        "id": str(created_answer.id),
                        "student_id": created_answer.student_id,
                        "question_id": str(created_answer.question_id),
                        "document_id": str(created_answer.document_id),
                        "answer": created_answer.answer,
                        "attempt": created_answer.attempt,
                        "submitted_at": created_answer.submitted_at.isoformat()
                    },
                    "feedback": feedback,
                    "attempt_number": 1,
                    "can_retry": not feedback.get("is_correct", False),
                    "max_attempts": 2
                }
            else:
                # Fallback if question/module not found
                return {
                    "success": True,
                    "answer": created_answer,
                    "feedback": None,
                    "message": "Answer submitted but feedback unavailable"
                }
                
        except Exception as e:
            # If feedback generation fails, still return successful answer submission
            return {
                "success": True,
                "answer": created_answer,
                "feedback": None,
                "error": f"Answer submitted but feedback failed: {str(e)}"
            }
    
    else:
        # For second attempt, return final result without feedback
        return {
            "success": True,
            "answer": created_answer,
            "attempt_number": answer_data.attempt,
            "final_submission": True,
            "message": "Final answer submitted successfully"
        }

# 📊 Get student's answers for a document
@router.get("/documents/{document_id}/my-answers", response_model=List[StudentAnswerOut])
def get_my_answers(
    document_id: UUID,
    student_id: str = Query(..., description="Student ID"),
    attempt: int = Query(1, description="Attempt number", ge=1, le=2),
    db: Session = Depends(get_db)
):
    """
    Get student's submitted answers for a document
    """
    answers = get_student_answers_by_document(db, student_id, document_id, attempt)
    return answers

# 📈 Get student's progress for a document
@router.get("/documents/{document_id}/progress")
def get_assignment_progress(
    document_id: UUID,
    student_id: str = Query(..., description="Student ID"),
    attempt: int = Query(1, description="Attempt number", ge=1, le=2),
    db: Session = Depends(get_db)
):
    """
    Get student's progress for an assignment
    """
    progress = get_student_progress(db, student_id, document_id, attempt)
    return progress

# ✏️ Update student answer
@router.put("/answers/{answer_id}", response_model=StudentAnswerOut)
def update_my_answer(
    answer_id: UUID,
    answer_data: StudentAnswerUpdate,
    db: Session = Depends(get_db)
):
    """
    Update student's answer (only if not completed)
    """
    updated_answer = update_student_answer(db, answer_id, answer_data)
    if not updated_answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    return updated_answer

# 🗑️ Delete student answer
@router.delete("/answers/{answer_id}")
def delete_my_answer(
    answer_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Delete student's answer (only if not completed)
    """
    deleted_answer = delete_student_answer(db, answer_id)
    if not deleted_answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    return {"detail": "Answer deleted successfully"}

# 🎯 Get specific student answer
@router.get("/questions/{question_id}/my-answer")
def get_my_answer_for_question(
    question_id: UUID,
    student_id: str = Query(..., description="Student ID"),
    attempt: int = Query(1, description="Attempt number", ge=1, le=2),
    db: Session = Depends(get_db)
):
    """
    Get student's answer for a specific question
    """
    answer = get_student_answer(db, student_id, question_id, attempt)
    if not answer:
        return None
    return answer

# 📈 Get student's progress for a module
@router.get("/modules/{module_id}/progress")
def get_module_progress(
    module_id: UUID,
    student_id: str = Query(..., description="Student ID"),
    attempt: int = Query(1, description="Attempt number", ge=1, le=2),
    db: Session = Depends(get_db)
):
    """
    Get student's progress for all questions in a module
    """
    from app.crud.student_answer import get_student_progress_by_module
    
    progress = get_student_progress_by_module(db, student_id, module_id, attempt)
    return progress