-- Migration: Add processing_status and processing_metadata to documents table
-- Date: 2025-10-13
-- Description: Add RAG processing status tracking to documents

-- Add new columns
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'uploaded' NOT NULL,
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_documents_processing_status ON documents(processing_status);

-- Update existing records to have 'uploaded' status
UPDATE documents
SET processing_status = 'uploaded'
WHERE processing_status IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN documents.processing_status IS 'RAG processing pipeline status: uploaded, extracting, extracted, chunking, chunked, embedding, embedded, indexed, failed';
COMMENT ON COLUMN documents.processing_metadata IS 'JSONB metadata for processing: chunk_count, embedding_model, error_msg, timestamps, etc.';

-- Verify the changes
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
AND column_name IN ('processing_status', 'processing_metadata', 'file_hash');
