

from fastapi import FastAPI
from typing import Union
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s - %(name)s - %(message)s'
)

# 🚦 Import API routers
from app.api.routes.test import router as test_router
from app.api.routes.user import router as user_router
from app.api.routes.auth import router as auth_router
from app.api.routes.document import router as document_router
from app.api.routes.question import router as question_router
from app.api.routes.module import router as module_router
from app.api.routes.student import router as student_router
from app.api.routes.student_answers import router as student_answers_router

from app.core.config import add_cors
from app.database import engine
from app.models import Base


app = FastAPI()

# 🚦 Apply CORS settings
add_cors(app)

# 🔌 Register API routes
app.include_router(test_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(document_router, prefix="/api", tags=["Documents"])
app.include_router(question_router, prefix="/api", tags=["Questions"])
app.include_router(module_router, prefix="/api", tags=["module"])
app.include_router(student_router, prefix="/api/student", tags=["Student"])
app.include_router(student_answers_router, prefix="/api/student-answers", tags=["Student Answers"])

# 🚀 Startup event to create all tables and import all models
@app.on_event("startup")
def on_startup():
    # ✅ Ensure all models are imported for table creation
    from app.models import user, document, question, module, student_answer, question_queue, document_chunk, document_embedding, ai_feedback
    print("🚀 App started! Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully (including ai_feedback table)")

# 📎 Test route
@app.get("/")
def read_root():
    return {"Hello": "World"}

# 📎 Sample item route
@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}