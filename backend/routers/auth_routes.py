from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.auth import create_access_token, get_current_user, verify_password
from core.db import get_db
from models.user import User
from schemas.auth import DemoUserResponse, LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email.lower()).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/demo-users", response_model=list[DemoUserResponse])
def get_demo_users():
    return [
        {
            "name": "Priya Sharma",
            "email": "priya.sharma@email.com",
            "role": "author",
            "description": "Author: 2 published titles, ₹11.9k royalties, active ISBN escalation ticket",
        },
        {
            "name": "Rohit Kapoor",
            "email": "rohit.kapoor@email.com",
            "role": "author",
            "description": "Author: Bestseller (1,200+ sold), ₹57k royalties, active print defect ticket",
        },
        {
            "name": "Diya Chatterjee",
            "email": "diya.chatterjee@email.com",
            "role": "author",
            "description": "Author: Pending royalty ₹850 (under ₹1,000 threshold policy edge case)",
        },
        {
            "name": "BookLeaf Operations Admin",
            "email": "admin@bookleaf.com",
            "role": "admin",
            "description": "Admin: Full triage queue, AI draft generator, staff notes, and overrides",
        },
    ]
