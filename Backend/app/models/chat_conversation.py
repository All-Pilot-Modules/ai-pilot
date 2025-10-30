from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime, timezone


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(String, nullable=False)  # Banner ID - no foreign key (matches student_enrollments pattern)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)  # Auto-generated from first message
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")
