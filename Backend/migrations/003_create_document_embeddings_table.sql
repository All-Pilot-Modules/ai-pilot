-- Migration: Create document_embeddings table
-- Date: 2025-10-13
-- Description: Store vector embeddings for document chunks for RAG retrieval

-- Create document_embeddings table
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Vector embedding (using float array for now, will migrate to pgvector later)
    -- OpenAI text-embedding-ada-002 produces 1536 dimensions
    embedding_vector float[] NOT NULL,

    -- Metadata
    embedding_model VARCHAR(100) NOT NULL DEFAULT 'text-embedding-ada-002',
    embedding_dimensions INTEGER NOT NULL DEFAULT 1536,
    token_count INTEGER,

    created_at TIMESTAMP DEFAULT NOW(),

    -- Ensure one embedding per chunk
    CONSTRAINT uix_embedding_chunk_id UNIQUE (chunk_id)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_embeddings_document_id ON document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_id ON document_embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_model ON document_embeddings(embedding_model);

-- Add comments for documentation
COMMENT ON TABLE document_embeddings IS 'Vector embeddings for document chunks for RAG retrieval';
COMMENT ON COLUMN document_embeddings.chunk_id IS 'Reference to the text chunk';
COMMENT ON COLUMN document_embeddings.document_id IS 'Reference to parent document';
COMMENT ON COLUMN document_embeddings.embedding_vector IS 'Vector embedding array (1536 dimensions for ada-002)';
COMMENT ON COLUMN document_embeddings.embedding_model IS 'Model used to generate embedding (e.g., text-embedding-ada-002)';
COMMENT ON COLUMN document_embeddings.embedding_dimensions IS 'Number of dimensions in the embedding vector';
COMMENT ON COLUMN document_embeddings.token_count IS 'Number of tokens used for this embedding';

-- Verify the table was created
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'document_embeddings'
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
WHERE rel.relname = 'document_embeddings';

-- Note: To enable pgvector in the future, run:
-- CREATE EXTENSION IF NOT EXISTS vector;
-- ALTER TABLE document_embeddings ALTER COLUMN embedding_vector TYPE vector(1536);
-- CREATE INDEX ON document_embeddings USING ivfflat (embedding_vector vector_cosine_ops);
