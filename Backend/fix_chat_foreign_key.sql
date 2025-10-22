-- Fix chat_conversations foreign key constraint
-- Problem: student_id references users table, but students don't have user accounts
-- Solution: Remove the foreign key constraint (student_id is just a banner ID string)

-- Drop the incorrect foreign key constraint
ALTER TABLE chat_conversations
DROP CONSTRAINT IF EXISTS chat_conversations_student_id_fkey;

-- student_id will remain as VARCHAR but without foreign key
-- (matching the pattern used in student_enrollments table)
