# pyrefly: ignore [missing-import]
import uuid

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.models.incident import Incident

from app.repositories.incident_repository import (
    IncidentRepository
)

from app.schemas.incident import (
    IncidentCreateRequest
)

from app.repositories.evidence_repository import (
    EvidenceRepository
)

class IncidentService:

    @staticmethod
    def create_incident(
        db: Session,
        user_id: uuid.UUID,
        payload: IncidentCreateRequest
    ) -> Incident:

        incident = Incident(
            user_id=user_id,

            incident_type=payload.incident_type,

            severity=payload.severity,

            description=payload.description,

            platform=payload.platform,

            captain_name=payload.captain_name,

            captain_phone=payload.captain_phone,

            app_fare=payload.app_fare,

            demanded_fare=payload.demanded_fare,

            incident_datetime=payload.incident_datetime,

            location=payload.location,

            status="OPEN"
        )

        return IncidentRepository.create(
            db,
            incident
        )

    @staticmethod
    def get_incident(
        db: Session,
        incident_id: uuid.UUID
    ):

        return IncidentRepository.get_by_id(
            db,
            incident_id
        )

    @staticmethod
    def get_user_incidents(
        db: Session,
        user_id: uuid.UUID
    ):

        return IncidentRepository.get_by_user(
            db,
            user_id
        )
    
    @staticmethod
    def get_incident_details(
        db,
        incident_id
    ):

        incident = (
            IncidentRepository.get_by_id(
                db,
                incident_id
            )
        )

        if not incident:
            return None

        evidences = (
            EvidenceRepository.get_by_incident(
                db,
                incident_id
            )
        )

        return (
            incident,
            evidences
        )