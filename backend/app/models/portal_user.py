import uuid
# pyrefly: ignore [missing-import]
from sqlalchemy import String, Boolean, DateTime
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import UUID
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column
# pyrefly: ignore [missing-import]
from sqlalchemy import func
from app.db.base import Base
from app.db.mixins import UUIDMixin


class PortalUser(UUIDMixin, Base):
    """
    Login accounts for Operator and Government portal users.
    These are separate from commuter (User) accounts.

    Access is controlled by email domain:
      @rapido.com, @ola.com, @uber.com → OPERATOR
      @gov.in, @tn.gov.in, @mh.gov.in → GOVERNMENT
    """
    __tablename__ = "portal_users"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # 'OPERATOR' or 'GOVERNMENT'
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True
    )

    # For OPERATOR: which platform they manage e.g. "Rapido"
    platform: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    # For GOVERNMENT: their jurisdiction e.g. "Tamil Nadu"
    jurisdiction: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
