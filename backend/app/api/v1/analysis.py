import json
import uuid
from datetime import datetime, timezone
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.dependencies import get_db
from app.repositories.incident_repository import IncidentRepository
from app.repositories.evidence_repository import EvidenceRepository
from app.services.ai_service import AIService

router = APIRouter(
    prefix="/analysis",
    tags=["AI Analysis"]
)


@router.post("/{incident_id}")
def analyze_incident(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    incident = IncidentRepository.get_by_id(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    evidences = EvidenceRepository.get_by_incident(db, incident_id)

    # Set status to PROCESSING
    incident.ai_analysis_status = "PROCESSING"
    db.commit()

    # Call Gemini 3.8 Flash AI service
    success, result_dict, error_str = AIService.analyze_incident(incident, evidences)

    if success and result_dict is not None:
        incident.ai_analysis_status = "DONE"
        incident.ai_analysis_result = json.dumps(result_dict)
        incident.ai_analysis_error = None
        incident.ai_analyzed_at = datetime.now(timezone.utc)
        db.commit()

        return {
            "status": "DONE",
            "result": result_dict,
            "analyzed_at": incident.ai_analyzed_at.isoformat()
        }
    else:
        incident.ai_analysis_status = "FAILED"
        incident.ai_analysis_error = error_str or "Unknown AI engine error"
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"AI Analysis failed: {incident.ai_analysis_error}"
        )
