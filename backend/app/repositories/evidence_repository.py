# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.models.evidence import Evidence


class EvidenceRepository:

    @staticmethod
    def create(
        db: Session,
        evidence: Evidence
    ) -> Evidence:

        db.add(evidence)

        db.commit()

        db.refresh(evidence)

        return evidence

    @staticmethod
    def get_by_incident(
        db: Session,
        incident_id
    ):

        return (
            db.query(Evidence)
            .filter(
                Evidence.incident_id == incident_id
            )
            .all()
        )