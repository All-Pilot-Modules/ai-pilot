from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import uuid
from datetime import datetime


# Default consent form template
DEFAULT_CONSENT_FORM = """
# Research Consent Form

## Purpose of the Study
This study aims to improve educational outcomes using AI-assisted learning tools. Your participation will help advance educational research and improve this platform for future students.

## What to Expect
- Your responses and interactions will be collected for research purposes
- All data will be anonymized and kept confidential
- Participation will not affect your grades or academic standing
- You may withdraw from the study at any time without penalty

## Your Rights
- Your participation is completely voluntary
- You can choose not to participate without any consequences
- All data collected will remain confidential and anonymous
- The research has been approved by the institutional review board

## Questions?
If you have any questions about this research, please contact your instructor.
"""


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

    # Consent form for research participation (customizable per module)
    consent_form_text = Column(Text, nullable=True, default=DEFAULT_CONSENT_FORM)
    consent_required = Column(Boolean, default=True)  # Whether students must fill consent before accessing

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