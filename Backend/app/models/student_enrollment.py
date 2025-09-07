from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime

class StudentEnrollment(Base):
    __tablename__ = "student_enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(String, nullable=False)  # Banner ID - student identifier
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    
    enrolled_at = Column(TIMESTAMP, default=datetime.utcnow)
    access_code_used = Column(String, nullable=False)  # The access code used to join
    
    # Ensure a student can only be enrolled once per module
    __table_args__ = (
        UniqueConstraint('student_id', 'module_id', name='uix_student_module_enrollment'),
    )