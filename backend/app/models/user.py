# pyrefly: ignore [missing-import]
from sqlalchemy import String
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import mapped_column
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.mixins import UUIDMixin
from app.db.mixins import TimestampMixin


class User(
    UUIDMixin,
    TimestampMixin,
    Base
):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    incidents = relationship(
        "Incident",
        back_populates="user",
        cascade="all, delete-orphan"
    )