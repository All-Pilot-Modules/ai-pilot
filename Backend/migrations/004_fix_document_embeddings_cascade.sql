-- Migration: Fix CASCADE delete for document_embeddings
-- Date: 2025-10-13
-- Description: Update foreign key constraints to use CASCADE delete

-- Drop existing foreign key constraints
ALTER TABLE document_embeddings
DROP CONSTRAINT IF EXISTS document_embeddings_chunk_id_fkey;

ALTER TABLE document_embeddings
DROP CONSTRAINT IF EXISTS document_embeddings_document_id_fkey;

-- Re-add foreign key constraints with CASCADE delete
ALTER TABLE document_embeddings
ADD CONSTRAINT document_embeddings_chunk_id_fkey
FOREIGN KEY (chunk_id) REFERENCES document_chunks(id) ON DELETE CASCADE;

ALTER TABLE document_embeddings
ADD CONSTRAINT document_embeddings_document_id_fkey
FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;

-- Verify the changes
SELECT
    con.conname as constraint_name,
    CASE con.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END as on_delete_action
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'document_embeddings'
AND con.contype = 'f';
