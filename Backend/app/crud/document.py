from sqlalchemy.orm import Session
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate
from datetime import datetime
import uuid
from typing import List, Optional
import os

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
        uploaded_at=datetime.utcnow()
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
        Document.is_testbank == False  # Never show test banks to students
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


def delete_document(db: Session, document_id: str) -> Optional[Document]:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return None

    # 🧹 Try to delete the physical file if it exists
    try:
        if os.path.exists(doc.storage_path):
            os.remove(doc.storage_path)
    except Exception as e:
        print(f"[WARNING] Failed to delete file at {doc.storage_path}: {e}")

    db.delete(doc)
    db.commit()
    return doc