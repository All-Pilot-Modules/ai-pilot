-- Migration: Make is_correct and score nullable in ai_feedback table
-- Date: 2025-10-24
-- Reason: Allow AI feedback generation for questions without correct answers

BEGIN;

-- Make is_correct nullable
ALTER TABLE ai_feedback
ALTER COLUMN is_correct DROP NOT NULL;

-- Make score nullable
ALTER TABLE ai_feedback
ALTER COLUMN score DROP NOT NULL;

-- Add comment to document the change
COMMENT ON COLUMN ai_feedback.is_correct IS 'Whether the answer is correct (NULL when no correct answer exists)';
COMMENT ON COLUMN ai_feedback.score IS 'Score from 0-100 (NULL when no correct answer exists)';

COMMIT;

-- Verify the migration
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ai_feedback'
  AND column_name IN ('is_correct', 'score');
