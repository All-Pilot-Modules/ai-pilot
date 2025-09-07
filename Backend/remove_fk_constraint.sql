-- SQL script to remove foreign key constraint from student_answers.student_id
-- This allows Banner IDs to be stored directly without requiring user records

-- First, we need to find the constraint name
-- Run this to see existing constraints:
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'student_answers' AND constraint_type = 'FOREIGN KEY';

-- Drop the foreign key constraint (replace 'constraint_name' with actual name)
-- ALTER TABLE student_answers DROP CONSTRAINT IF EXISTS student_answers_student_id_fkey;

-- Alternative approach: Drop and recreate the table if needed
-- (Only if there's no important data to preserve)
-- DROP TABLE IF EXISTS student_answers CASCADE;
-- Then restart the FastAPI app to recreate the table with the new structure

-- Note: The updated model in student_answer.py now has:
-- student_id = Column(String, nullable=False)  # No foreign key to users table
-- This allows Banner IDs to be stored directly as student identifiers