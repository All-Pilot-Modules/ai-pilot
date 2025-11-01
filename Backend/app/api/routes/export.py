"""
Export API Routes
Endpoints for exporting module data
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.services.export import module_export_service
from app.crud.module import get_module_by_id

router = APIRouter()


@router.get("/modules/{module_id}/export")
def export_module_data(
    module_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Export all module data to Excel file with multiple sheets

    **Sheets included:**
    1. Module Overview - Basic module information and statistics
    2. Questions - All questions with answers and metadata
    3. Student Enrollments - All enrolled students and consent status
    4. Answers (Attempt 1) - All student answers for first attempt
    5. Answers (Attempt 2) - All student answers for second attempt
    6. AI Feedback - All AI-generated feedback with scores
    7. Performance Summary - Student-level aggregated performance metrics
    8. Survey Responses - All survey responses (if applicable)

    **Returns:**
    Excel file (.xlsx) with all module data

    **Example:**
    ```
    GET /api/modules/123e4567-e89b-12d3-a456-426614174000/export
    ```
    """
    try:
        # Verify module exists
        module = get_module_by_id(db, module_id)
        if not module:
            raise HTTPException(status_code=404, detail=f"Module with ID {module_id} not found")

        # Generate Excel file
        excel_file = module_export_service.export_module_to_excel(db, module_id)

        # Create filename with module name and timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        # Sanitize module name for filename
        safe_module_name = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in module.name)
        filename = f"{safe_module_name}_export_{timestamp}.xlsx"

        # Return as downloadable file
        return StreamingResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=\"{filename}\"",
                "Cache-Control": "no-cache"
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"❌ Error exporting module data: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export module data: {str(e)}"
        )


@router.get("/modules/{module_id}/export/feedback")
def export_module_feedback(
    module_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Export feedback-specific format with all attempts and feedback

    **Format:**
    One row per student per question with columns:
    - Student ID
    - Question Text
    - Question Type
    - Correct Answer
    - Attempt 1 Answer, Feedback, Score, Correct
    - Attempt 2 Answer, Feedback, Score, Correct
    - ... (up to Attempt 5)

    **Returns:**
    Excel file (.xlsx) with feedback report

    **Example:**
    ```
    GET /api/modules/123e4567-e89b-12d3-a456-426614174000/export/feedback
    ```
    """
    try:
        # Verify module exists
        module = get_module_by_id(db, module_id)
        if not module:
            raise HTTPException(status_code=404, detail=f"Module with ID {module_id} not found")

        # Generate Excel file
        excel_file = module_export_service.export_feedback_specific(db, module_id)

        # Create filename with module name and timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        # Sanitize module name for filename
        safe_module_name = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in module.name)
        filename = f"{safe_module_name}_feedback_export_{timestamp}.xlsx"

        # Return as downloadable file
        return StreamingResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=\"{filename}\"",
                "Cache-Control": "no-cache"
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"❌ Error exporting feedback data: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export feedback data: {str(e)}"
        )


@router.get("/modules/{module_id}/export/summary")
def get_export_summary(
    module_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a preview/summary of what will be exported

    Useful for showing user counts before actual export

    **Returns:**
    ```json
    {
        "module_name": "Introduction to Python",
        "total_questions": 25,
        "total_students": 15,
        "total_answers": 375,
        "total_feedback": 350,
        "total_surveys": 12,
        "export_size_estimate": "~2.5 MB"
    }
    ```
    """
    try:
        from app.models.question import Question
        from app.models.student_answer import StudentAnswer
        from app.models.ai_feedback import AIFeedback
        from app.models.survey_response import SurveyResponse
        from app.models.student_enrollment import StudentEnrollment

        # Verify module exists
        module = get_module_by_id(db, module_id)
        if not module:
            raise HTTPException(status_code=404, detail=f"Module with ID {module_id} not found")

        # Get counts
        total_questions = db.query(Question).filter(Question.module_id == module_id).count()
        total_enrollments = db.query(StudentEnrollment).filter(StudentEnrollment.module_id == module_id).count()
        total_answers = db.query(StudentAnswer).filter(StudentAnswer.module_id == module_id).count()

        # Count feedback (joined through answers)
        total_feedback = db.query(AIFeedback).join(
            StudentAnswer, AIFeedback.answer_id == StudentAnswer.id
        ).filter(StudentAnswer.module_id == module_id).count()

        total_surveys = db.query(SurveyResponse).filter(SurveyResponse.module_id == module_id).count()

        # Rough size estimate (very approximate)
        estimated_rows = total_questions + total_enrollments + total_answers + total_feedback + total_surveys
        estimated_size_kb = estimated_rows * 2  # Rough estimate: 2KB per row

        if estimated_size_kb < 1024:
            size_estimate = f"~{estimated_size_kb} KB"
        else:
            size_estimate = f"~{estimated_size_kb / 1024:.1f} MB"

        return {
            "module_id": str(module_id),
            "module_name": module.name,
            "total_questions": total_questions,
            "total_students_enrolled": total_enrollments,
            "total_answers": total_answers,
            "total_feedback": total_feedback,
            "total_surveys": total_surveys,
            "export_size_estimate": size_estimate,
            "sheets": [
                "Module Overview",
                "Questions",
                "Student Enrollments",
                "Answers - Attempt 1",
                "Answers - Attempt 2",
                "AI Feedback",
                "Performance Summary",
                "Survey Responses"
            ]
        }

    except Exception as e:
        print(f"❌ Error getting export summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get export summary: {str(e)}"
        )
