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

# Get User Endpoints
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
            "platform": i.platform
        }
        for i in incidents
    ]