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
    Delete a module and all its associated documents from database and file system
    """
    print(f"Attempting to delete module with ID: {module_id}")
    try:
        # Find the module
        module = db.query(Module).filter(Module.id == module_id).first()
        if not module:
            print(f"Module not found with ID: {module_id}")
            return False
        
        print(f"Found module: {module.name} (ID: {module.id})")
        
        # Find all documents belonging to this module
        documents = db.query(Document).filter(Document.module_id == module.id).all()
        print(f"Found {len(documents)} documents to delete")
        
        # Delete files from upload folder
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
        
        # Delete documents from database
        db.query(Document).filter(Document.module_id == module.id).delete()
        
        # Try to remove the module folder if it's empty
        # Assuming upload structure is: uploads/{teacher_id}/{module_name}/
        upload_base = Path("uploads")
        module_folder = upload_base / module.teacher_id / module.name
        if module_folder.exists() and module_folder.is_dir():
            try:
                # Remove the module folder (will only work if empty or we force it)
                shutil.rmtree(module_folder)
                print(f"Deleted module folder: {module_folder}")
            except Exception as e:
                print(f"Failed to delete module folder {module_folder}: {e}")
        
        # Delete the module from database
        db.delete(module)
        db.commit()
        
        print(f"Successfully deleted module '{module.name}' and {len(documents)} associated documents")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"Error deleting module: {e}")
        raise e