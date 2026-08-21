# pyrefly: ignore [missing-import]
from pydantic import BaseModel


class EvidenceResponse(BaseModel):

    id: str

    incident_id: str

    evidence_type: str

    file_path: str