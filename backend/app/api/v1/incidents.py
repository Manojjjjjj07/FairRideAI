# pyrefly: ignore [missing-import]
import uuid

# pyrefly: ignore [missing-import]
from fastapi import APIRouter
# pyrefly: ignore [missing-import]
from fastapi import Depends
# pyrefly: ignore [missing-import]
from fastapi import HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.core.auth import get_current_user

from app.db.dependencies import get_db

from app.schemas.incident import (
    IncidentCreateRequest
)

from app.services.incident_service import (
    IncidentService
)

from app.repositories.incident_repository import (
    IncidentRepository
)

from app.repositories.evidence_repository import (
    EvidenceRepository
)

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


# Create Incident Endpoint
@router.post("/")
def create_incident(
    payload: IncidentCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    incident = (
        IncidentService.create_incident(
            db,
            current_user.id,
            payload
        )
    )

    return {
        "id": str(incident.id),
        "status": incident.status,
        "message": "Incident created successfully"
    }


# Get User Incidents
@router.get("/")
def get_my_incidents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    incidents = (
        IncidentService.get_user_incidents(
            db,
            current_user.id
        )
    )

    return [
        {
            "id": str(i.id),
            "incident_type": i.incident_type,
            "severity": i.severity,
            "status": i.status,
            "platform": i.platform,
            "latitude": i.latitude,
            "longitude": i.longitude
        }
        for i in incidents
    ]


# Get Incident Details
@router.get("/{incident_id}")
def get_incident_details(
    incident_id: uuid.UUID,

    db: Session = Depends(get_db),

    current_user=Depends(
        get_current_user
    )
):

    incident = (
        IncidentRepository.get_by_id(
            db,
            incident_id
        )
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    if incident.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    evidences = (
        EvidenceRepository.get_by_incident(
            db,
            incident_id
        )
    )

    return {
        "id": str(incident.id),

        "incident_type":
            incident.incident_type,

        "severity":
            incident.severity,

        "description":
            incident.description,

        "platform":
            incident.platform,

        "captain_name":
            incident.captain_name,

        "captain_phone":
            incident.captain_phone,

        "app_fare":
            incident.app_fare,

        "demanded_fare":
            incident.demanded_fare,

        "incident_datetime":
            incident.incident_datetime,

        "location":
            incident.location,

        "latitude":
            incident.latitude,

        "longitude":
            incident.longitude,

        "status":
            incident.status,

        "created_at":
            incident.created_at,

        "evidences": [

            {
                "id": str(e.id),

                "evidence_type":
                    e.evidence_type,

                "file_path":
                    e.file_path,

                "created_at":
                    e.created_at
            }

            for e in evidences
        ]
    }