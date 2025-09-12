-- Migration script to add assignment_config column to modules table

-- Add the assignment_config column with default value
ALTER TABLE modules ADD COLUMN assignment_config JSONB DEFAULT '{
  "features": {
    "multiple_attempts": {
      "enabled": false,
      "max_attempts": 2,
      "show_feedback_after_each": true
    },
    "chatbot_feedback": {
      "enabled": false,
      "conversation_mode": "guided",
      "ai_model": "gpt-4"
    },
    "mastery_learning": {
      "enabled": false,
      "streak_required": 3,
      "queue_randomization": true,
      "reset_on_wrong": false
    }
  },
  "display_settings": {
    "show_progress_bar": true,
    "show_streak_counter": true,
    "show_attempt_counter": true
  }
}';

-- Create the question_queue table
CREATE TABLE IF NOT EXISTS question_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT,
  module_id UUID,
  question_id UUID,
  position INTEGER,
  attempts INTEGER DEFAULT 0,
  is_mastered BOOLEAN DEFAULT false,
  streak_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE question_queue ADD CONSTRAINT fk_queue_student 
  FOREIGN KEY (student_id) REFERENCES users (id);

ALTER TABLE question_queue ADD CONSTRAINT fk_queue_module 
  FOREIGN KEY (module_id) REFERENCES modules (id);

ALTER TABLE question_queue ADD CONSTRAINT fk_queue_question 
  FOREIGN KEY (question_id) REFERENCES questions (id);

-- Add unique constraint to prevent duplicate queue entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_queue_unique 
  ON question_queue (student_id, module_id, question_id);

-- Update existing modules to have the default assignment config if they don't have one
UPDATE modules 
SET assignment_config = '{
  "features": {
    "multiple_attempts": {
      "enabled": false,
      "max_attempts": 2,
      "show_feedback_after_each": true
    },
    "chatbot_feedback": {
      "enabled": false,
      "conversation_mode": "guided",
      "ai_model": "gpt-4"
    },
    "mastery_learning": {
      "enabled": false,
      "streak_required": 3,
      "queue_randomization": true,
      "reset_on_wrong": false
    }
  },
  "display_settings": {
    "show_progress_bar": true,
    "show_streak_counter": true,
    "show_attempt_counter": true
  }
}'
WHERE assignment_config IS NULL;