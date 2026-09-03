"""
Complaint Routing API — POST /incidents/{id}/route

Allows a commuter to route their AI-verified complaint to:
  - The ride platform company (routed_to_operator = True)
  - The State Transport Authority (routed_to_government = True)

The incident then appears in the respective portal's complaint inbox.
No duplicate form — one complaint, multiple recipients.
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.dependencies import get_db
from app.repositories.incident_repository import IncidentRepository

router = APIRouter(prefix="/incidents", tags=["Complaint Routing"])


class RouteComplaintRequest(BaseModel):
    route_to_operator: bool = False
    route_to_government: bool = False


@router.post("/{incident_id}/route")
def route_complaint(
    incident_id: uuid.UUID,
    payload: RouteComplaintRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    incident = IncidentRepository.get_by_id(db, incident_id)

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if not payload.route_to_operator and not payload.route_to_government:
        raise HTTPException(
            status_code=400,
            detail="Select at least one routing target (operator or government)"
        )

    if payload.route_to_operator:
        incident.routed_to_operator = True
    if payload.route_to_government:
        incident.routed_to_government = True

    if payload.route_to_operator or payload.route_to_government:
        incident.routed_at = datetime.now(timezone.utc)

    db.commit()

    targets = []
    if incident.routed_to_operator:
        targets.append(incident.platform)
    if incident.routed_to_government:
        targets.append("State Transport Authority")

    return {
        "message": f"Complaint routed to: {', '.join(targets)}",
        "routed_to_operator": incident.routed_to_operator,
        "routed_to_government": incident.routed_to_government,
        "routed_at": incident.routed_at.isoformat() if incident.routed_at else None,
    }
