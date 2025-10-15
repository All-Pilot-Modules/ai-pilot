# Database Migrations

## How to Run Migrations

### Option 1: Using psql (Recommended)

```bash
# Connect to your database
psql "postgresql://username:password@host:port/database"

# Run the migration
\i migrations/001_add_processing_status_to_documents.sql
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `001_add_processing_status_to_documents.sql`
4. Click **Run**

### Option 3: Using Python script

```python
from app.database import engine

with open('migrations/001_add_processing_status_to_documents.sql', 'r') as f:
    sql = f.read()

with engine.connect() as conn:
    conn.execute(sql)
    conn.commit()
```

## Migration Files

### 001_add_processing_status_to_documents.sql
- **Purpose**: Add RAG processing status tracking to documents table
- **Changes**:
  - Adds `processing_status` column (VARCHAR)
  - Adds `processing_metadata` column (JSONB)
  - Creates index on `processing_status`
  - Updates existing records

**Status Values**:
- `uploaded` - File uploaded to storage
- `extracting` - Extracting text from file
- `extracted` - Text extraction complete
- `chunking` - Splitting text into chunks
- `chunked` - Chunking complete
- `embedding` - Generating embeddings
- `embedded` - Embeddings generated
- `indexed` - Ready for RAG retrieval
- `failed` - Processing failed

## Verify Migration

```sql
-- Check if columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'documents'
AND column_name IN ('processing_status', 'processing_metadata', 'file_hash');

-- Check existing data
SELECT id, title, file_hash, processing_status, processing_metadata
FROM documents
LIMIT 5;
```

## Rollback (if needed)

```sql
-- Remove the added columns
ALTER TABLE documents
DROP COLUMN IF EXISTS processing_status,
DROP COLUMN IF EXISTS processing_metadata;

-- Drop the index
DROP INDEX IF EXISTS idx_documents_processing_status;
```
