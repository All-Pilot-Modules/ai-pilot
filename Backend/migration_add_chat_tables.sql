-- Migration: Add chat_conversations and chat_messages tables
-- Description: Add database tables for AI tutor chatbot feature
-- Date: 2025-01-17

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL CHECK (role IN ('student', 'assistant')),
    content TEXT NOT NULL,
    context_used JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_student_module
    ON chat_conversations(student_id, module_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at
    ON chat_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
    ON chat_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
    ON chat_messages(created_at);

-- Add comments for documentation
COMMENT ON TABLE chat_conversations IS 'Stores chat conversations between students and AI tutor';
COMMENT ON TABLE chat_messages IS 'Stores individual messages in chat conversations';
COMMENT ON COLUMN chat_messages.role IS 'Message sender role: student or assistant';
COMMENT ON COLUMN chat_messages.context_used IS 'RAG context chunks used to generate assistant response';
