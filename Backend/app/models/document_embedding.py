"""
DocumentEmbedding model for storing vector embeddings of document chunks
Uses pgvector for similarity search
"""
from sqlalchemy import Column, String, Integer, ForeignKey, TIMESTAMP, Text, Float
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class DocumentEmbedding(Base):
    """
    Stores vector embeddings for document chunks
    Each chunk gets one embedding vector for RAG retrieval
    """
    __tablename__ = "document_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chunk_id = Column(UUID(as_uuid=True), ForeignKey("document_chunks.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)

    # Vector embedding - stored as ARRAY for now (will use pgvector extension later)
    # OpenAI text-embedding-ada-002 produces 1536 dimensions
    embedding_vector = Column(ARRAY(Float), nullable=False)

    # Metadata
    embedding_model = Column(String, nullable=False, default="text-embedding-ada-002")
    embedding_dimensions = Column(Integer, nullable=False, default=1536)
    token_count = Column(Integer)  # Tokens used for this embedding

    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    # Note: We don't need backref since CASCADE is handled at the database level via ondelete="CASCADE"
    # The foreign keys will automatically delete embeddings when parent document/chunk is deleted

    def __repr__(self):
        return f"<DocumentEmbedding(id={self.id}, chunk_id={self.chunk_id}, model={self.embedding_model})>"
