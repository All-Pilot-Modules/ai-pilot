from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
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

    created_at = Column(TIMESTAMP, default=datetime.utcnow)