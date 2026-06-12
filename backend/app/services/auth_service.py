# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest
from app.core.security import verify_password
from app.core.jwt import create_access_token

class AuthService:

    @staticmethod
    def register(
        db: Session,
        payload: RegisterRequest
    ) -> User:

        existing_user = (
            UserRepository.get_by_email(
                db,
                payload.email
            )
        )

        if existing_user:
            raise ValueError(
                "Email already registered"
            )

        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(
                payload.password
            )
        )

        return UserRepository.create(
            db,
            user
        )
    
    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str
    ) -> str:
        user = UserRepository.get_by_email(
            db,
            email
        )

        if not user:
            raise ValueError(
                "Invalid credentials"
            )

        if not verify_password(
            password,
            user.password_hash
        ):
            raise ValueError(
                "Invalid credentials"
            )

        token = create_access_token(
            {
                "sub": str(user.id)
            }
        )

        return token