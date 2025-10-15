"""
Pydantic schemas for DocumentChunk
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class DocumentChunkBase(BaseModel):
    """Base schema for document chunk"""
    document_id: UUID
    chunk_index: int
    chunk_text: str
    chunk_size: int
    chunk_metadata: Optional[Dict[str, Any]] = {}


class DocumentChunkCreate(BaseModel):
    """Schema for creating a chunk"""
    document_id: UUID
    chunk_index: int
    chunk_text: str
    chunk_metadata: Optional[Dict[str, Any]] = {}


class DocumentChunkOut(DocumentChunkBase):
    """Schema for returning chunk data"""
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True


class DocumentChunkSummary(BaseModel):
    """Summary info about chunks for a document"""
    document_id: UUID
    chunk_count: int
    total_characters: int
    metadata: Dict[str, Any]
