# app/utils/file.py

import os
import uuid
from app.core.config import UPLOAD_DIR

os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_file(file_bytes: bytes, filename: str, teacher_id: str) -> str:
    # Create teacher-specific folder
    teacher_dir = os.path.join(UPLOAD_DIR, teacher_id)
    os.makedirs(teacher_dir, exist_ok=True)

    # Add unique suffix to filename to prevent collisions
    unique_suffix = uuid.uuid4().hex[:8]
    name, ext = os.path.splitext(filename)
    unique_filename = f"{name}_{unique_suffix}{ext}"

    # Final path
    path = os.path.join(teacher_dir, unique_filename)

    # Write file
    with open(path, "wb") as f:
        f.write(file_bytes)

    return path  # Absolute path for saving into DB