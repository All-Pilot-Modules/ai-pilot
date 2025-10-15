from fastapi import APIRouter, Form, UploadFile, File, HTTPException, Depends, Query
from fastapi.responses import FileResponse
from uuid import UUID  
from sqlalchemy.orm import Session
from app.schemas.document import DocumentOut, DocumentUpdate
from app.services.document import handle_document_upload
from app.crud.document import (
    create_document,
    get_document_by_id as fetch_document_by_id,
    get_documents_by_teacher,
    get_documents_by_module,
    delete_document,
    update_document
)
from app.database import get_db
from app.services.document import reparse_testbank_document
router = APIRouter()

@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    module_name: str = Form(..., description="Name of the module (used as subfolder)"),
    teacher_id: str = Form(..., description="Teacher ID who owns this document"),
    title: str = Form(None),  # ✅ Optional custom title override
    db: Session = Depends(get_db)
):
    try:
        file_bytes = await file.read()
        document = handle_document_upload(
            db=db,
            file_bytes=file_bytes,
            filename=file.filename,
            teacher_id=teacher_id,
            title=title,
            module_name=module_name
        )
        return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📄 List all documents for a teacher, optionally filtered by module
@router.get("/documents", response_model=list[DocumentOut])
def list_documents(
    teacher_id: str = Query(..., description="Teacher ID to get documents for"),
    module_id: str = Query(None, description="Optional module ID to filter documents"),
    db: Session = Depends(get_db)
):
    if module_id:
        return get_documents_by_module(db, module_id)
    else:
        return get_documents_by_teacher(db, teacher_id)

# 📄 Fetch single document by ID
@router.get("/documents/{doc_id}", response_model=DocumentOut)
def get_document(
    doc_id: str, 
    db: Session = Depends(get_db)
):
    doc = fetch_document_by_id(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

# ❌ Delete document
@router.delete("/documents/{doc_id}")
def delete_document_by_id(
    doc_id: str, 
    db: Session = Depends(get_db)
):
    deleted_doc = delete_document(db, doc_id)
    if not deleted_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"detail": "Document deleted successfully."}

# ✏️ Update document (e.g., title/module)
@router.put("/documents/{doc_id}", response_model=DocumentOut)
def update_document_by_id(
    doc_id: str, 
    payload: DocumentUpdate, 
    db: Session = Depends(get_db)
):
    updated_doc = update_document(db, doc_id, payload)
    if not updated_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated_doc

# 📥 Download document by ID
@router.get("/documents/{doc_id}/download")
def download_document(
    doc_id: str,
    db: Session = Depends(get_db)
):
    from fastapi.responses import RedirectResponse
    from app.services.storage import storage_service
    import re

    doc = fetch_document_by_id(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check if storage_path is a URL (Supabase) or local path
    if doc.storage_path.startswith('http://') or doc.storage_path.startswith('https://'):
        # Extract the file path from the Supabase URL
        # URL format: https://xxx.supabase.co/storage/v1/object/public/uploads/001/two/file.docx?
        match = re.search(r'/storage/v1/object/public/[^/]+/(.+?)(\?|$)', doc.storage_path)

        if match:
            file_path = match.group(1)

            # Get a signed URL from Supabase (valid for 1 hour)
            try:
                signed_url = storage_service.get_signed_url(file_path, expires_in=3600)
                if signed_url:
                    return RedirectResponse(url=signed_url)
            except Exception as e:
                print(f"Failed to get signed URL: {e}")

        # Fallback: try the original URL (cleaned)
        clean_url = doc.storage_path.rstrip('?')
        return RedirectResponse(url=clean_url)
    else:
        # For local files, use FileResponse
        return FileResponse(
            path=doc.storage_path,
            filename=doc.file_name,
            media_type='application/octet-stream'
        )
    

@router.post("/documents/{doc_id}/reparse")
def reparse_document(
    doc_id: UUID, 
    db: Session = Depends(get_db)
):
    doc = fetch_document_by_id(db, str(doc_id))
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return reparse_testbank_document(db, doc_id)