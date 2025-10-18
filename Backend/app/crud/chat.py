"""
CRUD operations for chat conversations and messages
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from uuid import UUID

from app.models.chat_conversation import ChatConversation
from app.models.chat_message import ChatMessage
from app.schemas.chat import ChatConversationCreate, ChatMessageCreate


# Conversation CRUD
def create_conversation(db: Session, conversation_data: ChatConversationCreate) -> ChatConversation:
    """Create a new chat conversation"""
    conversation = ChatConversation(
        student_id=conversation_data.student_id,
        module_id=conversation_data.module_id,
        title=conversation_data.title
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def get_conversation(db: Session, conversation_id: UUID) -> Optional[ChatConversation]:
    """Get a conversation by ID"""
    return db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()


def get_conversations_by_student_module(
    db: Session,
    student_id: str,
    module_id: UUID,
    limit: int = 50
) -> List[ChatConversation]:
    """Get all conversations for a student in a module"""
    return db.query(ChatConversation).filter(
        ChatConversation.student_id == student_id,
        ChatConversation.module_id == module_id
    ).order_by(desc(ChatConversation.updated_at)).limit(limit).all()


def delete_conversation(db: Session, conversation_id: UUID) -> bool:
    """Delete a conversation and all its messages"""
    conversation = get_conversation(db, conversation_id)
    if not conversation:
        return False

    db.delete(conversation)
    db.commit()
    return True


def update_conversation_timestamp(db: Session, conversation_id: UUID):
    """Update the conversation's updated_at timestamp"""
    conversation = get_conversation(db, conversation_id)
    if conversation:
        from datetime import datetime
        conversation.updated_at = datetime.utcnow()
        db.commit()


# Message CRUD
def create_message(db: Session, message_data: ChatMessageCreate) -> ChatMessage:
    """Create a new chat message"""
    message = ChatMessage(
        conversation_id=message_data.conversation_id,
        role=message_data.role,
        content=message_data.content,
        context_used=message_data.context_used
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # Update conversation timestamp
    update_conversation_timestamp(db, message_data.conversation_id)

    return message


def get_conversation_messages(
    db: Session,
    conversation_id: UUID,
    limit: int = 100
) -> List[ChatMessage]:
    """Get all messages in a conversation, ordered chronologically"""
    return db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conversation_id
    ).order_by(ChatMessage.created_at).limit(limit).all()


def get_last_message(db: Session, conversation_id: UUID) -> Optional[ChatMessage]:
    """Get the last message in a conversation"""
    return db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conversation_id
    ).order_by(desc(ChatMessage.created_at)).first()


def get_message_count(db: Session, conversation_id: UUID) -> int:
    """Get the number of messages in a conversation"""
    return db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conversation_id
    ).count()


def generate_conversation_title(first_message: str, max_length: int = 50) -> str:
    """Generate a conversation title from the first message"""
    # Clean up the message
    title = first_message.strip()

    # Truncate if too long
    if len(title) > max_length:
        title = title[:max_length - 3] + "..."

    # If empty, use default
    if not title:
        title = "New Conversation"

    return title
