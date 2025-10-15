-- Migration: Create document_chunks table
-- Date: 2025-10-13
-- Description: Store text chunks from documents for RAG retrieval

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_size INTEGER NOT NULL,
    chunk_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Ensure unique chunk indices per document
    CONSTRAINT uix_document_chunk_index UNIQUE (document_id, chunk_index)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_chunk_index ON document_chunks(document_id, chunk_index);

-- Add comments for documentation
COMMENT ON TABLE document_chunks IS 'Text chunks extracted from documents for RAG retrieval';
COMMENT ON COLUMN document_chunks.document_id IS 'Parent document UUID';
COMMENT ON COLUMN document_chunks.chunk_index IS 'Order of this chunk in the document (0-based)';
COMMENT ON COLUMN document_chunks.chunk_text IS 'The actual text content of this chunk';
COMMENT ON COLUMN document_chunks.chunk_size IS 'Character count of chunk_text';
COMMENT ON COLUMN document_chunks.chunk_metadata IS 'Additional context: page_num, section, start_pos, end_pos, etc.';

-- Verify the table was created
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'document_chunks'
ORDER BY ordinal_position;

-- Show constraints
SELECT
    con.conname as constraint_name,
    con.contype as constraint_type,
    CASE con.contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'c' THEN 'CHECK'
        ELSE con.contype::text
    END as constraint_description
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'document_chunks';
