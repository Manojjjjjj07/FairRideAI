import uuid
# pyrefly: ignore [missing-import]
from sqlalchemy import Boolean, Float, ForeignKey, String, Text, DateTime
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import UUID
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.db.mixins import UUIDMixin, TimestampMixin



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

    # --- Driver Profile Link (cross-platform blacklist engine) ---
    driver_profile_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("driver_profiles.id"),
        nullable=True,
        index=True
    )

    vehicle_number: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    # --- Complaint Routing ---
    routed_to_operator: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    routed_to_government: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    routed_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
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

    driver_profile = relationship(
        "DriverProfile",
        back_populates="incidents"
    )