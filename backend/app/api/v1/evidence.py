import uuid
# pyrefly: ignore [missing-import]
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException
)

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.dependencies import get_db

from app.services.evidence_service import (
    EvidenceService
)

from app.repositories.incident_repository import (
    IncidentRepository
)

router = APIRouter(
    prefix="/evidence",
    tags=["Evidence"]
)

# Upload Endpoint
@router.post("/")
def upload_evidence(
    incident_id: uuid.UUID = Form(...),
    evidence_type: str = Form(...),
    file: UploadFile = File(...),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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

    folder_map = {

        "SCREENSHOT": "screenshots",

        "PAYMENT_PROOF": "payment_proofs",

        "AUDIO": "audio",

        "CHAT_EXPORT": "chat_exports",

        "OTHER": "other"
    }

    folder = folder_map.get(
        evidence_type.upper(),
        "other"
    )

    file_path = (
        EvidenceService.save_file(
            file,
            folder
        )
    )

    evidence = (
    EvidenceService.create_evidence(
        db,
        incident.id,
        evidence_type,
        file_path
        )
    )

    return {

        "id": str(evidence.id),

        "incident_id": str(
            evidence.incident_id
        ),

        "evidence_type": evidence.evidence_type,

        "file_path": evidence.file_path
    }
