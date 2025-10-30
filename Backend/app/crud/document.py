from sqlalchemy.orm import Session
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate
from datetime import datetime, timezone
import uuid
from typing import List, Optional
import os
from app.services.storage import storage_service

def create_document(db: Session, doc_data: DocumentCreate) -> Document:
    new_doc = Document(
        id=str(uuid.uuid4()),
        title=doc_data.title,
        file_name=doc_data.file_name,
        file_hash=doc_data.file_hash,
        file_type=doc_data.file_type,
        teacher_id=doc_data.teacher_id,
        module_id=doc_data.module_id,  # ✅ CHANGED from module_name to module_id
        storage_path=doc_data.storage_path,
        index_path=doc_data.index_path,
        slide_count=doc_data.slide_count,
        uploaded_at=datetime.now(timezone.utc)
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

def get_all_documents(db: Session) -> List[Document]:
    return db.query(Document).all()

def get_documents_by_teacher(db: Session, teacher_id: str) -> List[Document]:
    return db.query(Document).filter(Document.teacher_id == teacher_id).all()

def get_documents_by_module(db: Session, module_id) -> List[Document]:
    return db.query(Document).filter(Document.module_id == module_id).all()

def get_documents_by_module_for_students(db: Session, module_id) -> List[Document]:
    """Get documents for students - excludes test banks"""
    return db.query(Document).filter(
        Document.module_id == module_id,
        Document.is_testbank == False,  # Never show test banks to students
        ~Document.file_name.ilike('%testbank%')  # Also filter by filename containing 'testbank'
    ).all()


def get_document_by_id(db: Session, document_id: str) -> Optional[Document]:
    return db.query(Document).filter(Document.id == document_id).first()


def update_document(db: Session, document_id: str, update_data: DocumentUpdate) -> Optional[Document]:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return None

    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(doc, field, value)

    db.commit()
    db.refresh(doc)
    return doc


def delete_document(db: Session, document_id: str, delete_questions: bool = False) -> Optional[Document]:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return None

    # Get module info to construct Supabase path
    from app.models.module import Module
    module = db.query(Module).filter(Module.id == doc.module_id).first()

    if module:
        # 🧹 Delete from Supabase Storage
        try:
            storage_filename = f"{os.path.splitext(doc.file_name)[0]}_{doc.file_hash[:8]}.{doc.file_type}"
            supabase_file_path = f"{doc.teacher_id}/{module.name}/{storage_filename}"

            success = storage_service.delete_file(supabase_file_path)
            if success:
                print(f"✅ Deleted file from Supabase: {supabase_file_path}")
            else:
                print(f"[WARNING] Failed to delete file from Supabase: {supabase_file_path}")
        except Exception as e:
            print(f"[WARNING] Error deleting file from Supabase: {e}")

        # 🧹 Delete parsed_questions.json if this is a testbank and questions should be deleted
        if doc.is_testbank and delete_questions:
            try:
                parsed_json_path = f"{doc.teacher_id}/{module.name}/parsed_questions.json"
                success = storage_service.delete_file(parsed_json_path)
                if success:
                    print(f"✅ Deleted parsed questions JSON: {parsed_json_path}")
                else:
                    print(f"[INFO] No parsed_questions.json found to delete")
            except Exception as e:
                print(f"[WARNING] Error deleting parsed_questions.json: {e}")

    # 🧹 Delete questions from database if this is a testbank and delete_questions is True
    if doc.is_testbank and delete_questions:
        try:
            from app.models.question import Question
            deleted_count = db.query(Question).filter(Question.document_id == document_id).delete()
            db.commit()
            print(f"✅ Deleted {deleted_count} questions from database")
        except Exception as e:
            print(f"[WARNING] Error deleting questions from database: {e}")
            db.rollback()

    # 🧹 Try to delete local file if it exists (legacy support)
    try:
        if doc.storage_path and os.path.exists(doc.storage_path):
            os.remove(doc.storage_path)
            print(f"✅ Deleted local file: {doc.storage_path}")
    except Exception as e:
        print(f"[WARNING] Failed to delete local file at {doc.storage_path}: {e}")

    db.delete(doc)
    db.commit()
    return doc