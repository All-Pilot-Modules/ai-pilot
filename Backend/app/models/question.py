from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import uuid

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)

    type = Column(String, nullable=False)  # mcq, short, long
    text = Column(Text, nullable=False)
    slide_number = Column(Integer, nullable=True)

    options = Column(JSONB, nullable=True)  # Only for MCQs
    correct_answer = Column(String, nullable=True)

    learning_outcome = Column(String, nullable=True)
    bloom_taxonomy = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    has_text_input = Column(Boolean, default=False)

    __table_args__ = (
        Index('ix_questions_document_id', 'document_id'),
    )