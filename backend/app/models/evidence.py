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
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.mixins import UUIDMixin
from app.db.mixins import TimestampMixin


class Evidence(
    UUIDMixin,
    TimestampMixin,
    Base
):
    __tablename__ = "evidence"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("incidents.id"),
        nullable=False
    )

    evidence_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    incident = relationship(
        "Incident",
        back_populates="evidences"
    )