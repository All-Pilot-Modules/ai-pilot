from fastapi import APIRouter, Depends, HTTPException, Query, Path, UploadFile, File
from sqlalchemy.orm import Session
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionOut
from app.crud.question import (
    create_question,
    get_questions_by_document_id,
    get_questions_by_module_id,
    get_question_by_id,
    update_question,
    delete_question
)
from app.database import get_db
from app.services.storage import storage_service
from app.models.question import Question
from app.models.module import Module
from uuid import UUID
from typing import List
import os

router = APIRouter()

# ✅ Create a question
@router.post("/questions", response_model=QuestionOut)
def create_question_api(payload: QuestionCreate, db: Session = Depends(get_db)):
    try:
        print(f"📝 Creating question with data: {payload.dict()}")
        question = create_question(db, payload)
        print(f"✅ Question created with ID: {question.id}")
        return question
    except Exception as e:
        print(f"❌ Error creating question: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create question: {str(e)}")

# ✅ Get all questions for a document
@router.get("/questions", response_model=List[QuestionOut])
def get_questions_for_document(document_id: UUID = Query(...), db: Session = Depends(get_db)):
    return get_questions_by_document_id(db, document_id)

# ✅ Get all questions for a module
@router.get("/questions/by-module", response_model=List[QuestionOut])
def get_questions_for_module(module_id: UUID = Query(...), db: Session = Depends(get_db)):
    return get_questions_by_module_id(db, module_id)

# ✅ Get a single question
@router.get("/questions/{question_id}", response_model=QuestionOut)
def get_question_by_id_api(question_id: UUID, db: Session = Depends(get_db)):
    question = get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

# ✅ Update a question
@router.put("/questions/{question_id}", response_model=QuestionOut)
def update_question_api(question_id: UUID, payload: QuestionUpdate, db: Session = Depends(get_db)):
    updated = update_question(db, question_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Question not found")
    return updated

# ✅ Delete a question
@router.delete("/questions/{question_id}")
def delete_question_api(question_id: UUID, db: Session = Depends(get_db)):
    deleted = delete_question(db, question_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"detail": "Question deleted successfully."}

# 📷 Upload image for a question
@router.post("/questions/{question_id}/upload-image")
async def upload_question_image(
    question_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an image for a question and save it to Supabase storage
    Path: {teacher_id}/{module_name}/question_images/{question_id}.{ext}
    """
    print(f"📷 Upload image endpoint called")
    print(f"Question ID: {question_id}")
    print(f"File: {file.filename if file else 'No file'}")
    print(f"Content type: {file.content_type if file else 'No file'}")

    # Validate question exists
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        print(f"❌ Question not found: {question_id}")
        raise HTTPException(status_code=404, detail="Question not found")

    print(f"✅ Question found: {question.id}")

    # Get module info for path construction
    module = db.query(Module).filter(Module.id == question.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    # Validate file type
    allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    try:
        # Read file bytes
        file_bytes = await file.read()

        # Construct storage path - use separate bucket for images
        teacher_id = module.teacher_id
        storage_path = f"{teacher_id}/{module.name}/question_images/{question_id}.{file_ext}"

        # Use separate bucket for question images (should be public)
        image_bucket = "question-images"

        # Delete old image if exists
        if question.image_url:
            try:
                # Images are in separate bucket: question-images
                if 'question-images' in question.image_url:
                    old_path = question.image_url.split('/question-images/')[-1].split('?')[0]
                    from app.services.storage import SupabaseStorageService
                    old_image_storage = SupabaseStorageService(bucket_name="question-images")
                    old_image_storage.delete_file(old_path)
                else:
                    # Fallback for old images in uploads bucket
                    old_path = question.image_url.split('/uploads/')[-1].split('?')[0]
                    storage_service.delete_file(old_path)
                print(f"🗑️ Deleted old image: {old_path}")
            except Exception as e:
                print(f"[WARNING] Failed to delete old image: {e}")

        # Upload to separate public bucket for images
        from app.services.storage import SupabaseStorageService
        image_storage = SupabaseStorageService(bucket_name=image_bucket)
        image_url = image_storage.upload_file(file_bytes, storage_path)
        print(f"✅ Uploaded question image to {image_bucket}: {storage_path}")
        print(f"📷 Image URL returned: {image_url}")

        # Update question in database
        question.image_url = image_url
        db.commit()
        db.refresh(question)

        print(f"✅ Question updated in DB with image_url: {question.image_url}")

        return {
            "message": "Image uploaded successfully",
            "image_url": image_url
        }

    except Exception as e:
        print(f"❌ Error uploading image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

# 🗑️ Delete image for a question
@router.delete("/questions/{question_id}/image")
def delete_question_image(question_id: UUID, db: Session = Depends(get_db)):
    """
    Delete the image associated with a question
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if not question.image_url:
        raise HTTPException(status_code=404, detail="Question has no image")

    try:
        # Extract path from URL and delete from storage
        # Images are in separate bucket: question-images
        if 'question-images' in question.image_url:
            storage_path = question.image_url.split('/question-images/')[-1].split('?')[0]
            from app.services.storage import SupabaseStorageService
            image_storage = SupabaseStorageService(bucket_name="question-images")
            success = image_storage.delete_file(storage_path)
        else:
            # Fallback for old images in uploads bucket
            storage_path = question.image_url.split('/uploads/')[-1].split('?')[0]
            success = storage_service.delete_file(storage_path)

        if success:
            print(f"✅ Deleted question image: {storage_path}")
        else:
            print(f"[WARNING] Failed to delete image from storage: {storage_path}")

        # Remove image_url from database
        question.image_url = None
        db.commit()

        return {"message": "Image deleted successfully"}

    except Exception as e:
        print(f"❌ Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")