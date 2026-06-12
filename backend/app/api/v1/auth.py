# app/api/v1/auth.py
# pyrefly: ignore [missing-import]
from fastapi import APIRouter
# pyrefly: ignore [missing-import]
from fastapi import Depends
# pyrefly: ignore [missing-import]
from fastapi import HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.auth import RegisterRequest
from app.schemas.auth import LoginRequest
from app.services.auth_service import AuthService
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# POST /auth/register
@router.post("/register")
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db)
):
    try:
        user = AuthService.register(
            db=db,
            payload=payload
        )

        return {
            "message": "User registered successfully",
            "user_id": str(user.id)
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

#POST /auth/login
@router.post("/login")
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    try:

        token = AuthService.login(
            db,
            payload.email,
            payload.password
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )

@router.get("/me")
def me(
    current_user: User = Depends(
        get_current_user
    )
):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email
    }