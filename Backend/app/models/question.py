from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import uuid

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)

    type = Column(String, nullable=False)  # mcq, short, long
    text = Column(Text, nullable=False)
    slide_number = Column(Integer, nullable=True)
    question_order = Column(Integer, nullable=True)  # Order/position of question in the module

    options = Column(JSONB, nullable=True)  # Only for MCQs - format: {"A": "Apple", "B": "Ball"}
    correct_answer = Column(String, nullable=True)  # Legacy field - kept for backward compatibility
    correct_option_id = Column(String, nullable=True)  # New field - stores "A", "B", "C", "D" for MCQs

    learning_outcome = Column(String, nullable=True)
    bloom_taxonomy = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    has_text_input = Column(Boolean, default=False)

    __table_args__ = (
        Index('ix_questions_module_id', 'module_id'),
        Index('ix_questions_document_id', 'document_id'),
    )