import os
import json
from fastapi import HTTPException
from hashlib import sha256
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.question import Question
from app.models.user import User
from app.schemas.document import DocumentCreate
from app.schemas.question import QuestionCreate
from app.crud.document import create_document
from app.crud.question import bulk_create_questions
from app.utils.file import save_uploaded_file
from app.utils.pdf_extractor import extract_text_from_pdf
from app.utils.question_parser import parse_testbank_text_to_questions
from app.services.module import get_or_create_module


def handle_document_upload(
    db: Session,
    file_bytes: bytes,
    filename: str,
    teacher_id: str,
    title: str = None,
    module_name: str = None  # ✅ Human-readable module name
):
    # 🔍 Validate teacher
    teacher = db.query(User).filter(User.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=400, detail=f"Teacher with ID '{teacher_id}' not found.")

    # ✅ Get or create module by name
    module = get_or_create_module(db, teacher_id=teacher_id, module_name=module_name)

    # 🔐 Compute hash
    file_hash = sha256(file_bytes).hexdigest()
    file_ext = filename.split('.')[-1].lower()

    # 📁 Save to uploads/<teacher_id>/<module_name>/
    folder_path = os.path.join("uploads", teacher_id, module.name)
    os.makedirs(folder_path, exist_ok=True)
    storage_filename = f"{os.path.splitext(filename)[0]}_{file_hash[:8]}.{file_ext}"
    storage_path = os.path.join(folder_path, storage_filename)

    # 🚫 Check for duplicate
    if any(file_hash[:8] in f for f in os.listdir(folder_path)):
        raise HTTPException(
            status_code=409,
            detail=f"Duplicate detected: File with same content already exists."
        )

    # 💾 Save file
    with open(storage_path, "wb") as f:
        f.write(file_bytes)

    # 📦 Metadata
    index_path = f"indices/{teacher_id}/{file_hash}"
    resolved_title = title or filename
    slide_count = 0
    is_testbank = "testbank" in filename.lower()
    parse_status = "pending" if is_testbank else None

    # 🗃️ Save document in DB
    doc_data = DocumentCreate(
        title=resolved_title,
        file_name=filename,
        file_hash=file_hash,
        file_type=file_ext,
        teacher_id=teacher_id,
        module_id=module.id,
        storage_path=storage_path,
        index_path=index_path,
        slide_count=slide_count,
        parse_status=parse_status,
        parse_error=None,
        is_testbank=is_testbank
    )
    document = create_document(db, doc_data)

    # 🤖 Parse testbank if PDF
    if is_testbank and file_ext == "pdf":
        try:
            extracted_text = extract_text_from_pdf(storage_path)
            parsed_questions = parse_testbank_text_to_questions(extracted_text, document.id)

            # Save parsed questions to JSON
            json_path = os.path.join(folder_path, "parsed_questions.json")
            with open(json_path, "w") as f:
                json.dump(parsed_questions, f, indent=2)

            # Save to DB
            question_objs = [QuestionCreate(**q) for q in parsed_questions]
            bulk_create_questions(db, question_objs)

            document.parse_status = "success"
            document.parse_error = None
            db.commit()

        except Exception as e:
            document.parse_status = "failed"
            document.parse_error = str(e)
            db.commit()

    return document


def reparse_testbank_document(db: Session, document_id: UUID):
    from app.utils.pdf_extractor import extract_text_from_pdf
    from app.utils.question_parser import parse_testbank_text_to_questions
    from app.crud.question import bulk_create_questions
    from app.models.document import Document
    from app.models.question import Question
    from app.schemas.question import QuestionCreate

    # 🔎 Fetch document
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not doc.is_testbank:
        raise HTTPException(status_code=400, detail="This document is not a testbank and cannot be re-parsed.")

    if not doc.file_type.lower().endswith("pdf"):
        raise HTTPException(status_code=400, detail="Only PDF testbanks can be parsed")

    if not os.path.exists(doc.storage_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    try:
        extracted_text = extract_text_from_pdf(doc.storage_path)
        parsed_questions = parse_testbank_text_to_questions(extracted_text, doc.id)

        # 📁 Save under correct module folder
        from app.models.module import Module
        module = db.query(Module).filter(Module.id == doc.module_id).first()
        folder_path = os.path.join("uploads", doc.teacher_id, module.name)
        os.makedirs(folder_path, exist_ok=True)
        json_path = os.path.join(folder_path, "parsed_questions.json")

        with open(json_path, "w") as f:
            json.dump(parsed_questions, f, indent=2)

        # 🔁 Replace old questions
        db.query(Question).filter(Question.document_id == doc.id).delete()
        bulk_create_questions(db, [QuestionCreate(**q) for q in parsed_questions])

        # ✅ Update status
        doc.parse_status = "success"
        doc.parse_error = None
        db.commit()

        return {"message": "Re-parsing and saving successful."}

    except Exception as e:
        doc.parse_status = "failed"
        doc.parse_error = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Re-parsing failed: {str(e)}")