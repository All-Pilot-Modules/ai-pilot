"""
Pydantic schemas for DocumentEmbedding
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class DocumentEmbeddingBase(BaseModel):
    """Base schema for document embedding"""
    chunk_id: UUID
    document_id: UUID
    embedding_vector: List[float]
    embedding_model: str = "text-embedding-ada-002"
    embedding_dimensions: int = 1536
    token_count: Optional[int] = None


class DocumentEmbeddingCreate(BaseModel):
    """Schema for creating an embedding"""
    chunk_id: UUID
    document_id: UUID
    embedding_vector: List[float]
    embedding_model: str = "text-embedding-ada-002"
    embedding_dimensions: int = 1536
    token_count: Optional[int] = None


class DocumentEmbeddingOut(DocumentEmbeddingBase):
    """Schema for returning embedding data"""
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True


class EmbeddingSummary(BaseModel):
    """Summary info about embeddings for a document"""
    document_id: UUID
    embedding_count: int
    model: str
    dimensions: int
    total_tokens: int
