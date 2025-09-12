CREATE TABLE "users" (
  "id" text UNIQUE PRIMARY KEY,
  "username" text UNIQUE,
  "email" text UNIQUE,
  "hashed_password" text NOT NULL,
  "profile_image" text,
  "role" text NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now()),
  "is_active" boolean DEFAULT true
);

CREATE TABLE "modules" (
  "id" uuid PRIMARY KEY,
  "teacher_id" text NOT NULL,
  "name" text UNIQUE NOT NULL,
  "description" text,
  "access_code" text UNIQUE NOT NULL,
  "is_active" boolean DEFAULT true,
  "due_date" timestamp,
  "visibility" text DEFAULT 'class-only',
  "slug" text UNIQUE,
  "instructions" text,
  "assignment_config" jsonb DEFAULT '{
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
  }',
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "documents" (
  "id" uuid PRIMARY KEY,
  "title" text NOT NULL,
  "file_name" text NOT NULL,
  "file_hash" text NOT NULL,
  "file_type" text NOT NULL,
  "teacher_id" text NOT NULL,
  "module_id" uuid NOT NULL,
  "storage_path" text NOT NULL,
  "index_path" text,
  "slide_count" int,
  "parse_status" text,
  "parse_error" text,
  "is_testbank" boolean DEFAULT false,
  "uploaded_at" timestamp DEFAULT (now())
);

CREATE TABLE "questions" (
  "id" uuid PRIMARY KEY,
  "document_id" uuid NOT NULL,
  "type" text NOT NULL,
  "text" text NOT NULL,
  "slide_number" int,
  "options" jsonb,
  "correct_answer" text,
  "learning_outcome" text,
  "bloom_taxonomy" text,
  "image_url" text,
  "has_text_input" boolean DEFAULT false
);

CREATE TABLE "student_answers" (
  "id" uuid PRIMARY KEY,
  "student_id" text,
  "question_id" uuid,
  "document_id" uuid,
  "answer" jsonb,
  "attempt" int,
  "submitted_at" timestamp DEFAULT (now())
);

CREATE TABLE "ai_feedback" (
  "id" uuid PRIMARY KEY,
  "answer_id" uuid,
  "student_id" text,
  "question_id" uuid,
  "feedback" text,
  "correctness" text,
  "explanation" text,
  "improvement" text,
  "model_used" text,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "chat_messages" (
  "id" uuid PRIMARY KEY,
  "feedback_id" uuid,
  "user_id" text,
  "role" text,
  "message" text,
  "timestamp" timestamp DEFAULT (now())
);

CREATE TABLE "autosaves" (
  "id" uuid PRIMARY KEY,
  "user_id" text,
  "document_id" uuid,
  "question_id" uuid,
  "draft_answer" text,
  "attempt" int,
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "attempt_summary" (
  "id" uuid PRIMARY KEY,
  "student_id" text,
  "document_id" uuid,
  "total_questions" int,
  "correct_count" int,
  "weak_areas" jsonb,
  "attempt_number" int,
  "completed_at" timestamp DEFAULT (now())
);

CREATE TABLE "audio_explanations" (
  "id" uuid PRIMARY KEY,
  "feedback_id" uuid,
  "audio_url" text,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "document_chunks" (
  "id" uuid PRIMARY KEY,
  "document_id" uuid,
  "chunk_index" int,
  "text" text,
  "image_url" text,
  "embedding" vector,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "rubrics" (
  "id" uuid PRIMARY KEY,
  "question_id" uuid,
  "criterion" text,
  "weight" float,
  "max_score" int,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "rubric_scores" (
  "id" uuid PRIMARY KEY,
  "feedback_id" uuid,
  "rubric_id" uuid,
  "score" int,
  "comment" text
);

CREATE TABLE "question_queue" (
  "id" uuid PRIMARY KEY,
  "student_id" text,
  "module_id" uuid,
  "question_id" uuid,
  "position" int,
  "attempts" int DEFAULT 0,
  "is_mastered" boolean DEFAULT false,
  "streak_count" int DEFAULT 0,
  "last_attempt_at" timestamp,
  "created_at" timestamp DEFAULT (now())
);

CREATE UNIQUE INDEX "uix_teacher_filehash" ON "documents" ("teacher_id", "file_hash", "module_id");

CREATE INDEX "ix_questions_document_id" ON "questions" ("document_id");

CREATE UNIQUE INDEX ON "student_answers" ("student_id", "question_id", "attempt");

CREATE UNIQUE INDEX ON "question_queue" ("student_id", "module_id", "question_id");

COMMENT ON COLUMN "users"."id" IS 'Brockport Banner ID manually entered by user';

COMMENT ON COLUMN "users"."username" IS 'Optional username';

COMMENT ON COLUMN "users"."email" IS 'Optional email';

COMMENT ON COLUMN "users"."hashed_password" IS 'Password hash stored securely';

COMMENT ON COLUMN "users"."role" IS 'student, teacher, admin';

COMMENT ON COLUMN "users"."updated_at" IS 'Updates on modification';

COMMENT ON COLUMN "modules"."visibility" IS 'class-only, public, etc.';

COMMENT ON COLUMN "documents"."file_hash" IS 'Hash of file content';

COMMENT ON COLUMN "documents"."file_type" IS 'pdf, pptx, docx';

COMMENT ON COLUMN "documents"."module_id" IS 'Replaces module_name - now FK to modules table';

COMMENT ON COLUMN "documents"."index_path" IS 'Vector DB index path';

COMMENT ON COLUMN "documents"."parse_status" IS 'pending, success, failed, or null for non-testbanks';

COMMENT ON COLUMN "documents"."parse_error" IS 'Stores parsing error if any';

COMMENT ON COLUMN "documents"."is_testbank" IS 'True only if this is a testbank';

COMMENT ON COLUMN "questions"."document_id" IS 'CASCADE delete when document deleted';

COMMENT ON COLUMN "questions"."type" IS 'mcq, short, long';

COMMENT ON COLUMN "questions"."text" IS 'Question text - using Text type for longer content';

COMMENT ON COLUMN "questions"."options" IS 'Only for MCQs - JSONB format in PostgreSQL';

COMMENT ON COLUMN "questions"."image_url" IS 'Optional: for visual questions';

COMMENT ON COLUMN "questions"."has_text_input" IS 'true if MCQ + explanation';

COMMENT ON COLUMN "student_answers"."answer" IS 'Supports MCQ + text - using JSONB';

COMMENT ON COLUMN "student_answers"."attempt" IS '1 or 2';

COMMENT ON COLUMN "ai_feedback"."correctness" IS '✅ ❌ or %';

COMMENT ON COLUMN "ai_feedback"."model_used" IS 'GPT-4, Claude, etc.';

COMMENT ON COLUMN "chat_messages"."role" IS 'student or ai';

COMMENT ON COLUMN "attempt_summary"."weak_areas" IS 'Using JSONB instead of json';

COMMENT ON COLUMN "document_chunks"."image_url" IS 'Optional: for multimodal understanding';

COMMENT ON COLUMN "document_chunks"."embedding" IS 'Use pgvector extension';

COMMENT ON COLUMN "rubrics"."criterion" IS 'e.g., Relevance, Clarity';

ALTER TABLE "modules" ADD FOREIGN KEY ("teacher_id") REFERENCES "users" ("id");

ALTER TABLE "documents" ADD FOREIGN KEY ("teacher_id") REFERENCES "users" ("id");

ALTER TABLE "documents" ADD FOREIGN KEY ("module_id") REFERENCES "modules" ("id");

ALTER TABLE "questions" ADD FOREIGN KEY ("document_id") REFERENCES "documents" ("id");

ALTER TABLE "student_answers" ADD FOREIGN KEY ("student_id") REFERENCES "users" ("id");

ALTER TABLE "student_answers" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id");

ALTER TABLE "student_answers" ADD FOREIGN KEY ("document_id") REFERENCES "documents" ("id");

ALTER TABLE "ai_feedback" ADD FOREIGN KEY ("answer_id") REFERENCES "student_answers" ("id");

ALTER TABLE "ai_feedback" ADD FOREIGN KEY ("student_id") REFERENCES "users" ("id");

ALTER TABLE "ai_feedback" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id");

ALTER TABLE "chat_messages" ADD FOREIGN KEY ("feedback_id") REFERENCES "ai_feedback" ("id");

ALTER TABLE "chat_messages" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "autosaves" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "autosaves" ADD FOREIGN KEY ("document_id") REFERENCES "documents" ("id");

ALTER TABLE "autosaves" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id");

ALTER TABLE "attempt_summary" ADD FOREIGN KEY ("student_id") REFERENCES "users" ("id");

ALTER TABLE "attempt_summary" ADD FOREIGN KEY ("document_id") REFERENCES "documents" ("id");

ALTER TABLE "audio_explanations" ADD FOREIGN KEY ("feedback_id") REFERENCES "ai_feedback" ("id");

ALTER TABLE "document_chunks" ADD FOREIGN KEY ("document_id") REFERENCES "documents" ("id");

ALTER TABLE "rubrics" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id");

ALTER TABLE "rubric_scores" ADD FOREIGN KEY ("feedback_id") REFERENCES "ai_feedback" ("id");

ALTER TABLE "rubric_scores" ADD FOREIGN KEY ("rubric_id") REFERENCES "rubrics" ("id");

ALTER TABLE "question_queue" ADD FOREIGN KEY ("student_id") REFERENCES "users" ("id");

ALTER TABLE "question_queue" ADD FOREIGN KEY ("module_id") REFERENCES "modules" ("id");

ALTER TABLE "question_queue" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id");
