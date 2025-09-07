from sqlalchemy import Column, String, Boolean, TIMESTAMP
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, unique=True, index=True)  # Banner ID
    username = Column(String, unique=True, index=True, nullable=True)  # now optional
    email = Column(String, unique=True, index=True, nullable=True)     # now optional
    hashed_password = Column(String, nullable=False)  # password hash
    profile_image = Column(String, nullable=True)
    role = Column(String, nullable=False)  # student, teacher, admin
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)