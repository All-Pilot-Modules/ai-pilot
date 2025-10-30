from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.schemas.user import UserLogin, Token, UserCreate, UserOut
from app.core.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_active_user,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS
)
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.id == user_data.id) | 
        (User.email == user_data.email) |
        (User.username == user_data.username)
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="User with this ID, email, or username already exists"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    db_user = User(
        id=user_data.id,
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        profile_image=user_data.profile_image,
        role=user_data.role or "student"  # Default role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token."""
    # Find user by ID or email
    user = db.query(User).filter(
        (User.id == user_data.identifier) | 
        (User.email == user_data.identifier)
    ).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token and refresh token with user role and additional claims
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.id,
            "role": user.role,
            "email": user.email,
            "username": user.username
        },
        expires_delta=access_token_expires
    )

    # Create refresh token (longer expiration)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        data={"sub": user.id},
        expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # seconds
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current authenticated user information."""
    return current_user

@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    try:
        # Verify refresh token
        payload = verify_token(refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Check if it's actually a refresh token
        # Note: verify_token returns TokenData which doesn't have 'type' by default
        # We need to decode the token again to check type
        import jwt as pyjwt
        from app.core.auth import SECRET_KEY, ALGORITHM
        decoded = pyjwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])

        if decoded.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )

        # Get user from database
        user = db.query(User).filter(User.id == payload.user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(
            data={
                "sub": user.id,
                "role": user.role,
                "email": user.email,
                "username": user.username
            },
            expires_delta=access_token_expires
        )

        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )

@router.post("/logout")
def logout():
    """Logout user (client-side token removal)."""
    return {"message": "Successfully logged out"}