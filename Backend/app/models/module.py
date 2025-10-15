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
        },
        "feedback_rubric": {
            "enabled": True,
            "grading_criteria": {
                "accuracy": {"weight": 40, "description": "Correctness of the answer"},
                "completeness": {"weight": 30, "description": "Covers all required points"},
                "clarity": {"weight": 20, "description": "Clear and well-structured explanation"},
                "depth": {"weight": 10, "description": "Level of detail and insight"}
            },
            "feedback_style": {
                "tone": "encouraging",
                "detail_level": "detailed",
                "include_examples": True,
                "reference_course_material": True
            },
            "rag_settings": {
                "enabled": True,
                "max_context_chunks": 3,
                "similarity_threshold": 0.7,
                "include_source_references": True
            },
            "custom_instructions": "",
            "question_type_settings": {
                "mcq": {
                    "explain_correct": True,
                    "explain_incorrect": True,
                    "show_all_options_analysis": False
                },
                "short_answer": {
                    "minimum_length": 50,
                    "check_grammar": False
                },
                "essay": {
                    "require_structure": True,
                    "check_citations": False,
                    "minimum_paragraphs": 2
                }
            }
        }
    })

    created_at = Column(TIMESTAMP, default=datetime.utcnow)