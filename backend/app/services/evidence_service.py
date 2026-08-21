import uuid
from pathlib import Path
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from fastapi import UploadFile

from app.models.evidence import Evidence

from app.repositories.evidence_repository import (
    EvidenceRepository
)

class EvidenceService:

    UPLOAD_DIR = "uploads"

    @staticmethod
    def save_file(
        file,
        folder: str
    ):

        Path(
            f"uploads/{folder}"
        ).mkdir(
            parents=True,
            exist_ok=True
        )

        extension = (
            Path(file.filename)
            .suffix
        )

        unique_name = (
            f"{uuid.uuid4()}{extension}"
        )

        file_path = (
            f"uploads/{folder}/{unique_name}"
        )

        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(
                file.file.read()
            )

        return file_path
    
    @staticmethod
    def create_evidence(
        db: Session,
        incident_id,
        evidence_type: str,
        file_path: str
    ):

        evidence = Evidence(
            incident_id=incident_id,
            evidence_type=evidence_type,
            file_path=file_path
        )

        return (
            EvidenceRepository.create(
                db,
                evidence
            )
        )