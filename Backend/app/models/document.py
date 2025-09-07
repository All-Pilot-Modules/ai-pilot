from sqlalchemy import Boolean, Column, String, Integer, TIMESTAMP, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_hash = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # e.g., pdf, pptx, docx

    teacher_id = Column(String, ForeignKey("users.id"), nullable=False)

    # 🔗 Replaces `module_name`
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id"), nullable=False)

    storage_path = Column(String, nullable=False)
    index_path = Column(String, nullable=True)
    slide_count = Column(Integer, nullable=True)
    parse_status = Column(String, nullable=True)  # 'pending', 'success', 'failed'
    parse_error = Column(String, nullable=True)
    is_testbank = Column(Boolean, default=False)
    uploaded_at = Column(TIMESTAMP, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('teacher_id', 'file_hash', 'module_id', name='uix_teacher_filehash'),
    )