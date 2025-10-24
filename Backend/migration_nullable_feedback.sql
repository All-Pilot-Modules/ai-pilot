-- Migration: Make feedback correctness fields nullable
-- Purpose: Allow AI feedback when correct answer is not set
-- Date: 2025-10-23

-- ========================================
-- Make is_correct and score nullable in ai_feedback table
-- ========================================

-- Allow is_correct to be NULL (for questions without correct answers)
ALTER TABLE ai_feedback
ALTER COLUMN is_correct DROP NOT NULL;

-- Allow score to be NULL (for questions without correct answers)
ALTER TABLE ai_feedback
ALTER COLUMN score DROP NOT NULL;

-- ========================================
-- Verification
-- ========================================

-- Check that columns are now nullable
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ai_feedback'
  AND column_name IN ('is_correct', 'score');

-- Show sample data
SELECT
    id,
    is_correct,
    score,
    created_at
FROM ai_feedback
ORDER BY created_at DESC
LIMIT 5;

SELECT '✅ Feedback fields migration completed - is_correct and score are now nullable!' as status;
