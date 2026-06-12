# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest


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