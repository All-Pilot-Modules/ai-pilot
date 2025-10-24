-- Migration: Add Survey Feature
-- Purpose: Add survey questions to modules and survey responses table
-- Date: 2025-10-23

-- ========================================
-- 1. Add survey columns to modules table
-- ========================================

-- Add survey_questions JSONB column (stores array of question objects)
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS survey_questions JSONB;

-- Add survey_required boolean column (whether survey is mandatory)
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS survey_required BOOLEAN DEFAULT FALSE;

-- ========================================
-- 2. Create survey_responses table
-- ========================================

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR NOT NULL,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    responses JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one response per student per module
    CONSTRAINT uix_student_module_survey UNIQUE (student_id, module_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_module_id ON survey_responses(module_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_student_id ON survey_responses(student_id);

-- ========================================
-- 3. Populate default survey questions for existing modules
-- ========================================

UPDATE modules
SET survey_questions = '[
    {
        "id": "q1",
        "question": "What did you find most helpful in this module?",
        "type": "long",
        "required": true,
        "placeholder": "Please share what aspects helped you learn effectively..."
    },
    {
        "id": "q2",
        "question": "What aspects of the module were challenging?",
        "type": "long",
        "required": false,
        "placeholder": "Describe any difficulties or areas for improvement..."
    },
    {
        "id": "q3",
        "question": "How would you rate your overall learning experience? (Please explain)",
        "type": "short",
        "required": true,
        "placeholder": "Your rating and brief explanation..."
    },
    {
        "id": "q4",
        "question": "Any suggestions for improvement?",
        "type": "long",
        "required": false,
        "placeholder": "Share your ideas..."
    },
    {
        "id": "q5",
        "question": "Additional comments:",
        "type": "long",
        "required": false,
        "placeholder": "Any other feedback you''d like to share..."
    }
]'::jsonb
WHERE survey_questions IS NULL;

-- Set survey_required to false for existing modules (opt-in)
UPDATE modules
SET survey_required = FALSE
WHERE survey_required IS NULL;

-- ========================================
-- 4. Add comments for documentation
-- ========================================

COMMENT ON COLUMN modules.survey_questions IS 'Survey questions for student feedback (JSONB array)';
COMMENT ON COLUMN modules.survey_required IS 'Whether students must complete the survey';
COMMENT ON TABLE survey_responses IS 'Student survey responses for modules';
COMMENT ON COLUMN survey_responses.responses IS 'Survey answers keyed by question ID';

-- ========================================
-- 5. Verification
-- ========================================

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'modules' AND column_name IN ('survey_questions', 'survey_required');

-- Verify table was created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'survey_responses';

-- Check how many modules have default survey questions
SELECT
    COUNT(*) as total_modules,
    COUNT(survey_questions) as modules_with_survey,
    SUM(CASE WHEN survey_required THEN 1 ELSE 0 END) as modules_requiring_survey
FROM modules;

-- Show sample survey questions from first module
SELECT
    name,
    survey_required,
    jsonb_array_length(survey_questions) as num_questions,
    survey_questions
FROM modules
LIMIT 1;

-- ========================================
-- Migration Complete
-- ========================================

SELECT '✅ Survey feature migration completed successfully!' as status;
