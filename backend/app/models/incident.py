import uuid
# pyrefly: ignore [missing-import]
from sqlalchemy import ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy import String
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import UUID
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import mapped_column

from app.db.base import Base
from app.db.mixins import UUIDMixin
from app.db.mixins import TimestampMixin


class Incident(
    UUIDMixin,
    TimestampMixin,
    Base
):
    __tablename__ = "incidents"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id")
    )

    incident_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )