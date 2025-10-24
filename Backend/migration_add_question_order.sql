-- Migration: Add question_order column to questions table
-- Purpose: Store the order/position of questions within a module
-- Date: 2025-10-23

-- Add question_order column
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS question_order INTEGER;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_questions_question_order
ON questions(module_id, question_order);

-- Assign order to existing questions based on their creation order (by UUID)
-- This assigns sequential numbers to existing questions per module
WITH numbered_questions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY module_id ORDER BY id) as row_num
  FROM questions
  WHERE question_order IS NULL
)
UPDATE questions
SET question_order = numbered_questions.row_num
FROM numbered_questions
WHERE questions.id = numbered_questions.id;

-- Verify the migration
SELECT
  module_id,
  COUNT(*) as total_questions,
  COUNT(question_order) as questions_with_order,
  MIN(question_order) as min_order,
  MAX(question_order) as max_order
FROM questions
GROUP BY module_id
ORDER BY module_id;

COMMENT ON COLUMN questions.question_order IS 'Order/position of question within the module';
