from fastapi import APIRouter, Depends, HTTPException, Query, Path
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
from uuid import UUID
from typing import List

router = APIRouter()

# ✅ Create a question
@router.post("/questions", response_model=QuestionOut)
def create_question_api(payload: QuestionCreate, db: Session = Depends(get_db)):
    try:
        return create_question(db, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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