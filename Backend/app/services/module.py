from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.module import Module
from app.models.document import Document
from uuid import uuid4
from datetime import datetime
import secrets
import slugify  # type: ignore # Requires `python-slugify`
import os
import shutil
from pathlib import Path

def get_or_create_module(db: Session, teacher_id: str, module_name: str) -> Module:
    # Validate inputs
    if not teacher_id or not module_name:
        raise ValueError("teacher_id and module_name are required")
    
    existing = db.query(Module).filter_by(teacher_id=teacher_id, name=module_name).first()
    if existing:
        return existing

    try:
        # Generate slug with fallback
        slug = slugify.slugify(module_name) or module_name.lower().replace(' ', '-')
        
        new_module = Module(
            id=uuid4(),
            teacher_id=teacher_id,
            name=module_name,
            slug=slug,
            access_code=secrets.token_hex(3),
            is_active=True,
            visibility="class-only",
            created_at=datetime.utcnow()
        )
        db.add(new_module)
        db.commit()
        db.refresh(new_module)
        return new_module
        
    except IntegrityError:
        db.rollback()
        # Try to get existing module that might have been created concurrently
        existing = db.query(Module).filter_by(teacher_id=teacher_id, name=module_name).first()
        if existing:
            return existing
        # If still not found, raise error instead of returning None
        raise ValueError(f"Failed to create or find module '{module_name}' for teacher '{teacher_id}'")
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error creating module: {str(e)}")

def delete_module_with_documents(db: Session, module_id: str) -> bool:
    """
    Delete a module and all its associated data (documents, questions, student answers) from database and file system
    """
    print(f"Attempting to delete module with ID: {module_id}")
    try:
        # Find the module
        module = db.query(Module).filter(Module.id == module_id).first()
        if not module:
            print(f"Module not found with ID: {module_id}")
            return False

        print(f"Found module: {module.name} (ID: {module.id})")

        # Import models here to avoid circular imports
        from app.models.question import Question
        from app.models.student_answer import StudentAnswer
        from app.models.question_queue import QuestionQueue

        # Get simple counts for logging using list length (safer than count() queries)
        documents = db.query(Document).filter(Document.module_id == module.id).all()
        documents_count = len(documents)

        # Check if questions have module_id or document_id (depending on schema migration status)
        try:
            questions = db.query(Question.id).filter(Question.module_id == module.id).all()
            questions_count = len(questions)
        except Exception:
            # Fallback: questions may still use document_id if migration hasn't been applied
            questions = []
            for doc in documents:
                doc_questions = db.query(Question.id).filter(Question.document_id == doc.id).all()
                questions.extend(doc_questions)
            questions_count = len(questions)

        # Check if student_answers have module_id or document_id
        try:
            answers = db.query(StudentAnswer.id).filter(StudentAnswer.module_id == module.id).all()
            answers_count = len(answers)
        except Exception:
            # Fallback: answers may still use document_id if migration hasn't been applied
            answers = []
            for doc in documents:
                doc_answers = db.query(StudentAnswer.id).filter(StudentAnswer.document_id == doc.id).all()
                answers.extend(doc_answers)
            answers_count = len(answers)

        queue_items = db.query(QuestionQueue.id).filter(QuestionQueue.module_id == module.id).all()
        queue_count = len(queue_items)

        print(f"Found {documents_count} documents, {questions_count} questions, {answers_count} student answers, {queue_count} queue items to delete")

        # Delete physical files first
        for document in documents:
            if document.storage_path and os.path.exists(document.storage_path):
                try:
                    os.remove(document.storage_path)
                    print(f"Deleted file: {document.storage_path}")
                except Exception as e:
                    print(f"Failed to delete file {document.storage_path}: {e}")

            # Also delete the JSON index file if it exists
            if hasattr(document, 'index_path') and document.index_path and os.path.exists(document.index_path):
                try:
                    os.remove(document.index_path)
                    print(f"Deleted index file: {document.index_path}")
                except Exception as e:
                    print(f"Failed to delete index file {document.index_path}: {e}")

        # Delete database records in proper order (respecting foreign keys)
        # Using individual record deletion instead of bulk delete to avoid SQLAlchemy issues

        # 1. Delete question queue items first (they reference questions and modules)
        try:
            queue_items_to_delete = db.query(QuestionQueue).filter(QuestionQueue.module_id == module.id).all()
            for item in queue_items_to_delete:
                db.delete(item)
            print(f"Deleted {len(queue_items_to_delete)} question queue items")
        except Exception as e:
            print(f"Error deleting question queue items: {e}")

        # 2. Delete student answers (handle both module_id and document_id schemas)
        try:
            # Try module_id first (new schema)
            try:
                answers_to_delete = db.query(StudentAnswer).filter(StudentAnswer.module_id == module.id).all()
            except Exception:
                # Fallback to document_id (old schema)
                answers_to_delete = []
                for doc in documents:
                    doc_answers = db.query(StudentAnswer).filter(StudentAnswer.document_id == doc.id).all()
                    answers_to_delete.extend(doc_answers)

            for answer in answers_to_delete:
                db.delete(answer)
            print(f"Deleted {len(answers_to_delete)} student answers")
        except Exception as e:
            print(f"Error deleting student answers: {e}")

        # 3. Skip student enrollments (table doesn't exist in current schema)
        print("Skipped student enrollments (table doesn't exist)")

        # 4. Delete questions (handle both module_id and document_id schemas)
        try:
            # Try module_id first (new schema)
            try:
                questions_to_delete = db.query(Question).filter(Question.module_id == module.id).all()
            except Exception:
                # Fallback to document_id (old schema)
                questions_to_delete = []
                for doc in documents:
                    doc_questions = db.query(Question).filter(Question.document_id == doc.id).all()
                    questions_to_delete.extend(doc_questions)

            for question in questions_to_delete:
                db.delete(question)
            print(f"Deleted {len(questions_to_delete)} questions")
        except Exception as e:
            print(f"Error deleting questions: {e}")

        # 5. Delete documents (they reference module)
        try:
            # We already have documents from earlier
            for document in documents:
                db.delete(document)
            print(f"Deleted {len(documents)} documents")
        except Exception as e:
            print(f"Error deleting documents: {e}")

        # Try to remove the module folder
        upload_base = Path("uploads")
        module_folder = upload_base / module.teacher_id / module.name
        if module_folder.exists() and module_folder.is_dir():
            try:
                # Remove the module folder and all contents
                shutil.rmtree(module_folder)
                print(f"Deleted module folder: {module_folder}")
            except Exception as e:
                print(f"Failed to delete module folder {module_folder}: {e}")

        # 4. Finally delete the module itself
        db.delete(module)
        db.commit()

        print(f"Successfully deleted module '{module.name}' with {documents_count} documents, {questions_count} questions, {answers_count} student answers, and {queue_count} queue items")
        return True

    except Exception as e:
        db.rollback()
        print(f"Error deleting module: {e}")
        raise e