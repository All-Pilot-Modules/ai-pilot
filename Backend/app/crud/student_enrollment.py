from sqlalchemy.orm import Session
from app.models.student_enrollment import StudentEnrollment
from app.models.module import Module
from app.schemas.student_enrollment import StudentEnrollmentCreate
from uuid import UUID
from typing import List, Optional

def enroll_student_in_module(db: Session, enrollment_data: StudentEnrollmentCreate) -> Optional[StudentEnrollment]:
    """
    Enroll a student in a module using access code
    """
    # First, verify the access code exists and get the module
    module = db.query(Module).filter(
        Module.access_code == enrollment_data.access_code,
        Module.is_active == True
    ).first()
    
    if not module:
        return None  # Invalid access code or inactive module
    
    # Check if student is already enrolled
    existing_enrollment = db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == enrollment_data.student_id,
        StudentEnrollment.module_id == module.id
    ).first()
    
    if existing_enrollment:
        return existing_enrollment  # Already enrolled
    
    # Create new enrollment
    db_enrollment = StudentEnrollment(
        student_id=enrollment_data.student_id,
        module_id=module.id,
        access_code_used=enrollment_data.access_code
    )
    
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

def get_student_enrollments(db: Session, student_id: str) -> List[StudentEnrollment]:
    """
    Get all modules a student is enrolled in
    """
    return db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == student_id
    ).all()

def get_module_enrollments(db: Session, module_id: UUID) -> List[StudentEnrollment]:
    """
    Get all students enrolled in a specific module
    """
    return db.query(StudentEnrollment).filter(
        StudentEnrollment.module_id == module_id
    ).all()

def get_enrolled_students_with_info(db: Session, module_id: UUID) -> List[dict]:
    """
    Get all students enrolled in a module with their enrollment info
    """
    enrollments = db.query(StudentEnrollment).filter(
        StudentEnrollment.module_id == module_id
    ).all()
    
    students = []
    for enrollment in enrollments:
        students.append({
            "student_id": enrollment.student_id,
            "enrolled_at": enrollment.enrolled_at,
            "access_code_used": enrollment.access_code_used
        })
    
    return students

def is_student_enrolled_in_module(db: Session, student_id: str, module_id: UUID) -> bool:
    """
    Check if a student is enrolled in a specific module
    """
    enrollment = db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == student_id,
        StudentEnrollment.module_id == module_id
    ).first()
    
    return enrollment is not None

def get_enrollment_by_student_and_module(db: Session, student_id: str, module_id: UUID) -> Optional[StudentEnrollment]:
    """
    Get specific enrollment record for student and module
    """
    return db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == student_id,
        StudentEnrollment.module_id == module_id
    ).first()