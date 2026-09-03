import uuid
# pyrefly: ignore [missing-import]
from sqlalchemy import String, Integer, Text, Date, DateTime
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import UUID, JSONB
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column
# pyrefly: ignore [missing-import]
from sqlalchemy import func
from app.db.base import Base
from app.db.mixins import UUIDMixin


class IntelligenceReport(UUIDMixin, Base):
    """
    Weekly or monthly AI-generated intelligence reports.
    Can target a specific operator platform or all platforms (government).
    """
    __tablename__ = "intelligence_reports"

    # 'WEEKLY' | 'MONTHLY'
    report_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    # 'OPERATOR' | 'GOVERNMENT'
    target_audience: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    # For OPERATOR reports: which platform. Null = all platforms (govt report)
    platform: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    period_start: Mapped[Date] = mapped_column(
        Date,
        nullable=False
    )

    period_end: Mapped[Date] = mapped_column(
        Date,
        nullable=False
    )

    total_incidents: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    new_watchlist: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    new_blacklisted: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    # Gemini-generated executive summary text
    ai_brief: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Structured stats snapshot as JSON
    summary_json: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True
    )

    generated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
