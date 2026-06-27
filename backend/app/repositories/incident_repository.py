# pyrefly: ignore [missing-import]
import uuid

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.models.incident import Incident


class IncidentRepository:

    @staticmethod
    def create(
        db: Session,
        incident: Incident
    ) -> Incident:

        db.add(incident)

        db.commit()

        db.refresh(incident)

        return incident

    @staticmethod
    def get_by_id(
        db: Session,
        incident_id: uuid.UUID
    ) -> Incident | None:

        return (
            db.query(Incident)
            .filter(
                Incident.id == incident_id
            )
            .first()
        )

    @staticmethod
    def get_by_user(
        db: Session,
        user_id: uuid.UUID
    ) -> list[Incident]:

        return (
            db.query(Incident)
            .filter(
                Incident.user_id == user_id
            )
            .order_by(
                Incident.created_at.desc()
            )
            .all()
        )