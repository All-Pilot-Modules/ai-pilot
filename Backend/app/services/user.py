from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone

def create_user(db: Session, user_data: UserCreate):
    # Check if Banner ID already exists
    if db.query(User).filter(User.id == user_data.id).first():
        raise ValueError("User with this Banner ID already exists.")

    # Check if email exists (if provided)
    if user_data.email:
        if db.query(User).filter(User.email == user_data.email).first():
            raise ValueError("Email is already in use.")

    # Check if username exists (if provided)
    if user_data.username:
        if db.query(User).filter(User.username == user_data.username).first():
            raise ValueError("Username is already taken.")

    # Always assign student if not specified
    user = User(
        id=user_data.id,
        username=user_data.username,
        email=user_data.email,
        profile_image=user_data.profile_image,
        role=user_data.role or "student",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        raise ValueError("User creation failed due to database constraint.")