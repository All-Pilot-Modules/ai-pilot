from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.schemas.student_answer import StudentAnswerCreate, StudentAnswerOut, StudentAnswerUpdate
from app.schemas.feedback import AIFeedbackResponse
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
from app.services.ai_feedback import AIFeedbackService
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
                Question.correct_answer,
                Question.correct_option_id
            ).join(Question, StudentAnswer.question_id == Question.id)

            if student_id:
                query = query.filter(StudentAnswer.student_id == student_id)

            results = query.all()

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
@router.post("/")
def create_new_student_answer(
    answer_data: StudentAnswerCreate,
    generate_feedback: bool = Query(False, description="Automatically generate AI feedback"),
    db: Session = Depends(get_db)
):
    """
    Create a new student answer, optionally with AI feedback

    Args:
        answer_data: Student answer data
        generate_feedback: If True, automatically generates AI feedback for the answer
        db: Database session

    Returns:
        Dictionary containing:
        - answer: The created/updated student answer
        - feedback: AI feedback (if generate_feedback=True)
    """
    try:
        # Check if answer already exists for this attempt
        existing_answer = get_student_answer(
            db, answer_data.student_id, answer_data.question_id, answer_data.attempt
        )

        if existing_answer:
            # Update existing answer
            update_data = StudentAnswerUpdate(answer=answer_data.answer)
            saved_answer = update_student_answer(db, existing_answer.id, update_data)
        else:
            # Create new answer
            saved_answer = create_student_answer(db, answer_data)

        # Prepare response
        result = {
            "answer": {
                "id": str(saved_answer.id),
                "student_id": saved_answer.student_id,
                "question_id": str(saved_answer.question_id),
                "module_id": str(saved_answer.module_id),
                "document_id": str(saved_answer.document_id) if saved_answer.document_id else None,
                "answer": saved_answer.answer,
                "attempt": saved_answer.attempt,
                "submitted_at": saved_answer.submitted_at.isoformat()
            }
        }

        # Generate feedback if requested (typically for first attempt)
        if generate_feedback:
            try:
                feedback_service = AIFeedbackService()
                feedback = feedback_service.generate_instant_feedback(
                    db=db,
                    student_answer=saved_answer,
                    question_id=str(saved_answer.question_id),
                    module_id=str(saved_answer.module_id)
                )
                result["feedback"] = feedback
                result["feedback_generated"] = not feedback.get("error", False)

            except Exception as feedback_error:
                # Don't fail the entire request if feedback generation fails
                result["feedback"] = None
                result["feedback_generated"] = False
                result["feedback_error"] = str(feedback_error)

        return result

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


# Generate AI feedback for a student answer
@router.post("/{answer_id}/feedback", response_model=AIFeedbackResponse)
def generate_feedback_for_answer(
    answer_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Generate AI feedback for a specific student answer using rubric and RAG

    This endpoint:
    1. Retrieves the student answer from the database
    2. Loads the module's rubric configuration
    3. Retrieves relevant course material context (RAG)
    4. Builds a dynamic prompt based on rubric settings
    5. Calls OpenAI API to generate feedback
    6. Returns structured feedback with scores and explanations
    """
    try:
        # Get the student answer
        answer = get_student_answer_by_id(db, answer_id)
        if not answer:
            raise HTTPException(status_code=404, detail="Student answer not found")

        # Initialize AI feedback service
        feedback_service = AIFeedbackService()

        # Generate feedback with rubric and RAG integration
        feedback = feedback_service.generate_instant_feedback(
            db=db,
            student_answer=answer,
            question_id=str(answer.question_id),
            module_id=str(answer.module_id)
        )

        # Check for errors
        if feedback.get("error"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate feedback: {feedback.get('message', 'Unknown error')}"
            )

        return feedback

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate feedback: {str(e)}"
        )


# Get feedback for all answers in a module (batch)
@router.post("/modules/{module_id}/feedback/batch")
def generate_batch_feedback(
    module_id: UUID,
    student_id: Optional[str] = Query(None, description="Filter by student ID"),
    attempt: int = Query(1, description="Attempt number", ge=1, le=2),
    db: Session = Depends(get_db)
):
    """
    Generate feedback for multiple student answers in a module (batch operation)
    Useful for generating feedback for all students after they submit
    """
    try:
        # Get all answers for this module
        from app.models.student_answer import StudentAnswer
        query = db.query(StudentAnswer).filter(
            StudentAnswer.module_id == module_id,
            StudentAnswer.attempt == attempt
        )

        if student_id:
            query = query.filter(StudentAnswer.student_id == student_id)

        answers = query.all()

        if not answers:
            return {
                "message": "No answers found",
                "feedback_generated": 0,
                "results": []
            }

        # Generate feedback for each answer
        feedback_service = AIFeedbackService()
        results = []
        success_count = 0

        for answer in answers:
            try:
                feedback = feedback_service.generate_instant_feedback(
                    db=db,
                    student_answer=answer,
                    question_id=str(answer.question_id),
                    module_id=str(answer.module_id)
                )

                results.append({
                    "answer_id": str(answer.id),
                    "student_id": answer.student_id,
                    "question_id": str(answer.question_id),
                    "success": not feedback.get("error", False),
                    "feedback": feedback
                })

                if not feedback.get("error"):
                    success_count += 1

            except Exception as e:
                results.append({
                    "answer_id": str(answer.id),
                    "student_id": answer.student_id,
                    "question_id": str(answer.question_id),
                    "success": False,
                    "error": str(e)
                })

        return {
            "message": f"Generated feedback for {success_count}/{len(answers)} answers",
            "feedback_generated": success_count,
            "total_answers": len(answers),
            "results": results
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate batch feedback: {str(e)}"
        )



    
    
