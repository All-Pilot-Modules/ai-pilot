"""
Document Chunks Model
Stores text chunks extracted from documents for RAG retrieval
"""
from sqlalchemy import Column, String, Integer, Text, ForeignKey, TIMESTAMP, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime


class DocumentChunk(Base):
    """
    Represents a text chunk from a document
    Documents are split into chunks for efficient embedding and retrieval
    """
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Chunk ordering and content
    chunk_index = Column(Integer, nullable=False)  # Order within document (0, 1, 2, ...)
    chunk_text = Column(Text, nullable=False)      # The actual text content
    chunk_size = Column(Integer, nullable=False)    # Character count

    # Metadata for context (renamed from 'metadata' to avoid SQLAlchemy conflict)
    chunk_metadata = Column(JSONB, default={})  # Store: page_num, section, start_pos, end_pos, heading, etc.

    # Timestamps
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Ensure each document has unique chunk indices
    __table_args__ = (
        UniqueConstraint('document_id', 'chunk_index', name='uix_document_chunk_index'),
        Index('idx_chunks_document_id', 'document_id'),  # Fast lookup by document
    )

    def __repr__(self):
        return f"<DocumentChunk(id={self.id}, doc_id={self.document_id}, index={self.chunk_index}, size={self.chunk_size})>"
