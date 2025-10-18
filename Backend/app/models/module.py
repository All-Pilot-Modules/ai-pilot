from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import uuid
from datetime import datetime


class Module(Base):
    __tablename__ = "modules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False)

    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    access_code = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    due_date = Column(TIMESTAMP, nullable=True)
    visibility = Column(String, default="class-only")  # e.g., 'class-only', 'public'
    # class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=True)
    slug = Column(String, unique=True, nullable=True)
    instructions = Column(String, nullable=True)

    # Dedicated column for feedback rubric configuration (easier to query and manage)
    feedback_rubric = Column(JSONB, nullable=True)

    assignment_config = Column(JSONB, default={
        "features": {
            "multiple_attempts": {
                "enabled": True,
                "max_attempts": 2,
                "show_feedback_after_each": True
            },
            "chatbot_feedback": {
                "enabled": True,
                "conversation_mode": "guided",
                "ai_model": "gpt-4"
            },
            "mastery_learning": {
                "enabled": False,
                "streak_required": 3,
                "queue_randomization": True,
                "reset_on_wrong": False
            }
        },
        "display_settings": {
            "show_progress_bar": True,
            "show_streak_counter": True,
            "show_attempt_counter": True
        }
        # Note: feedback_rubric moved to dedicated column for better management
    })

    created_at = Column(TIMESTAMP, default=datetime.utcnow)