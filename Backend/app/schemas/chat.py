from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime


# Chat Message Schemas
class ChatMessageBase(BaseModel):
    role: str = Field(..., description="Message role: 'student' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatMessageCreate(ChatMessageBase):
    conversation_id: UUID = Field(..., description="Conversation ID")
    context_used: Optional[Dict[str, Any]] = Field(None, description="RAG context used (for assistant messages)")


class ChatMessageOut(ChatMessageBase):
    id: UUID
    conversation_id: UUID
    context_used: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Chat Conversation Schemas
class ChatConversationBase(BaseModel):
    title: str = Field(..., description="Conversation title")


class ChatConversationCreate(BaseModel):
    student_id: str = Field(..., description="Student ID")
    module_id: UUID = Field(..., description="Module ID")
    title: str = Field(..., description="Conversation title")


class ChatConversationOut(ChatConversationBase):
    id: UUID
    student_id: str
    module_id: UUID
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = Field(None, description="Number of messages in conversation")
    last_message_preview: Optional[str] = Field(None, description="Preview of last message")

    class Config:
        from_attributes = True


class ChatConversationWithMessages(ChatConversationOut):
    messages: List[ChatMessageOut] = []


# Request/Response Schemas
class SendMessageRequest(BaseModel):
    message: str = Field(..., description="Student's message", min_length=1)


class SendMessageResponse(BaseModel):
    student_message: ChatMessageOut
    assistant_message: ChatMessageOut
    conversation_id: UUID
