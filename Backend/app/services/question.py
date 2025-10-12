from sqlalchemy.orm import Session
from app.schemas.question import QuestionCreate
from app.crud.question import bulk_create_questions
import json
import os
from uuid import UUID

def save_questions_to_db_and_json(
    db: Session,
    questions: list[QuestionCreate],
    module_id: UUID,
    document_id: UUID = None,
    output_json_path: str = None
):
    # ✅ Ensure module_id is attached and optionally document_id
    for q in questions:
        q.module_id = module_id
        if document_id:
            q.document_id = document_id

    # ✅ Save to database
    saved_questions = bulk_create_questions(db, questions)

    # ✅ Serialize for JSON (if path provided)
    if output_json_path:
        serialized = [q.dict() for q in questions]

        # ✅ Ensure output folder exists
        os.makedirs(os.path.dirname(output_json_path), exist_ok=True)

        # ✅ Write to file
        with open(output_json_path, "w") as f:
            json.dump(serialized, f, indent=2)

    return saved_questions