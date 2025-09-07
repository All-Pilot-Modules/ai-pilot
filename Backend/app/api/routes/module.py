from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.schemas.module import ModuleCreate, ModuleOut
from app.crud.module import (
    create_module,
    get_module_by_id,
    get_modules_by_teacher,
    delete_module,
    update_module,
    get_all_modules
)
from app.services.module import delete_module_with_documents
from app.database import get_db

router = APIRouter()

# 🔍 Get all modules (admin-level or dashboard-level use)
@router.get("/modules/all", response_model=List[ModuleOut])
def list_all_modules(db: Session = Depends(get_db)):
    return get_all_modules(db)

# 🔍 List modules by teacher
@router.get("/modules", response_model=List[ModuleOut])
def list_modules(teacher_id: str = Query(...), db: Session = Depends(get_db)):
    return get_modules_by_teacher(db, teacher_id)

# 🔍 Get single module by ID
@router.get("/modules/{module_id}", response_model=ModuleOut)
def get_single_module(module_id: UUID, db: Session = Depends(get_db)):
    module = get_module_by_id(db, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

# ➕ Create new module
@router.post("/modules", response_model=ModuleOut)
def create_new_module(payload: ModuleCreate, db: Session = Depends(get_db)):
    try:
        return create_module(db, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create module: {str(e)}")

# 🖊️ Update existing module
@router.put("/modules/{module_id}", response_model=ModuleOut)
def update_existing_module(module_id: UUID, payload: ModuleCreate, db: Session = Depends(get_db)):
    updated = update_module(db, module_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Module not found")
    return updated

# ❌ Delete module and all associated documents
@router.delete("/modules/{module_id}")
def remove_module(module_id: UUID, db: Session = Depends(get_db)):
    print(f"Delete request received for module_id: {module_id} (type: {type(module_id)})")
    try:
        success = delete_module_with_documents(db, str(module_id))
        if not success:
            raise HTTPException(status_code=404, detail="Module not found")
        return {"detail": "Module and all associated documents deleted successfully."}
    except ValueError as ve:
        print(f"ValueError in module deletion: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Unexpected error in module deletion: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete module: {str(e)}")

# 🔄 Regenerate access code for module
@router.post("/modules/{module_id}/regenerate-code", response_model=ModuleOut)
def regenerate_access_code(module_id: UUID, db: Session = Depends(get_db)):
    """
    Regenerate a new access code for the module
    """
    import secrets
    
    module = get_module_by_id(db, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Generate new access code
    new_access_code = secrets.token_hex(3).upper()  # 6-character hex code
    
    # Update module with new access code
    module.access_code = new_access_code
    db.commit()
    db.refresh(module)
    
    return module