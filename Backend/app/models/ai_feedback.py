from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, TIMESTAMP, Index, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import uuid
from datetime import datetime

class AIFeedback(Base):
    __tablename__ = "ai_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Link to student answer (single source of truth)
    answer_id = Column(UUID(as_uuid=True), ForeignKey("student_answers.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Correctness
    is_correct = Column(Boolean, nullable=False)
    score = Column(Integer, nullable=False)  # 0-100

    # Feedback content (stored as JSONB for flexibility)
    feedback_data = Column(JSONB, nullable=False)  # Contains explanation, hints, strengths, weaknesses, etc.

    # Timestamp
    generated_at = Column(TIMESTAMP, default=datetime.utcnow)

    __table_args__ = (
        Index('ix_ai_feedback_answer_id', 'answer_id'),
        Index('ix_ai_feedback_generated_at', 'generated_at'),
    )
