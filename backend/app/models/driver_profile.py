import uuid
# pyrefly: ignore [missing-import]
from sqlalchemy import Float, String, Text, Integer, DateTime
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import UUID, ARRAY
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.db.mixins import UUIDMixin, TimestampMixin


class DriverProfile(
    UUIDMixin,
    TimestampMixin,
    Base
):
    """
    Cross-platform driver entity.
    Keyed by canonical (normalized) phone number.
    Aggregates incidents across all ride platforms to power
    the cross-platform blacklist and risk scoring engine.
    """
    __tablename__ = "driver_profiles"

    canonical_phone: Mapped[str] = mapped_column(
        String(15),
        nullable=False,
        unique=True,
        index=True
    )

    # All name spellings seen across platforms e.g. ["Jack Sparrow", "Jacky Sparow"]
    aliases: Mapped[list] = mapped_column(
        ARRAY(String),
        default=list,
        server_default="{}"
    )

    # Platforms this driver has been reported on e.g. ["Rapido", "Namma Yatri"]
    platforms: Mapped[list] = mapped_column(
        ARRAY(String),
        default=list,
        server_default="{}"
    )

    risk_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0
    )

    # NONE | WATCHLIST | BLACKLIST_RECOMMENDED | BLACKLISTED
    blacklist_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="NONE",
        index=True
    )

    total_incidents: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    blacklisted_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Email of operator/government officer who confirmed the blacklist
    blacklisted_by: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    blacklist_note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Back-reference: all incidents linked to this driver profile
    incidents = relationship(
        "Incident",
        back_populates="driver_profile",
        lazy="dynamic"
    )
