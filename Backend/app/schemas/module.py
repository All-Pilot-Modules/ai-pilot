from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any

class ModuleBase(BaseModel):
    teacher_id: str
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True
    due_date: Optional[datetime] = None
    visibility: Optional[str] = "class-only"  # can be 'class-only' or 'public'
    slug: Optional[str] = None
    instructions: Optional[str] = None
    assignment_config: Optional[Dict[str, Any]] = {
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
    }

class ModuleCreate(ModuleBase):
    pass

class ModuleOut(ModuleBase):
    id: UUID
    access_code: str
    created_at: datetime
    assignment_config: Optional[Dict[str, Any]] = None

    class Config:
        orm_mode = True