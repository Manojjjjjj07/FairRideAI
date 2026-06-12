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
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


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