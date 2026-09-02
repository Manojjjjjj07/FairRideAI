import uuid
# pyrefly: ignore [missing-import]
from sqlalchemy import Float
# pyrefly: ignore [missing-import]
from sqlalchemy import ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy import String
# pyrefly: ignore [missing-import]
from sqlalchemy import Text
# pyrefly: ignore [missing-import]
from sqlalchemy import DateTime
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import UUID

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import mapped_column
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
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
        ForeignKey("users.id"),
        nullable=False
    )

    incident_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    platform: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    captain_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    captain_phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    app_fare: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    demanded_fare: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    incident_datetime: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="OPEN"
    )

    ai_analysis_status: Mapped[str | None] = mapped_column(
        String(20),
        default="PENDING"
    )

    ai_analysis_result: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    ai_analysis_error: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    ai_analyzed_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )


    user = relationship(
        "User",
        back_populates="incidents"
    )

    evidences = relationship(
        "Evidence",
        back_populates="incident",
        cascade="all, delete-orphan"
    )