import uuid
from typing import Optional
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.models.driver_profile import DriverProfile


class DriverProfileRepository:

    @staticmethod
    def get_by_phone(db: Session, canonical_phone: str) -> Optional[DriverProfile]:
        return db.query(DriverProfile).filter(
            DriverProfile.canonical_phone == canonical_phone
        ).first()

    @staticmethod
    def get_by_id(db: Session, driver_id: uuid.UUID) -> Optional[DriverProfile]:
        return db.query(DriverProfile).filter(
            DriverProfile.id == driver_id
        ).first()

    @staticmethod
    def create(
        db: Session,
        canonical_phone: str,
        alias: str,
        platform: str
    ) -> DriverProfile:
        driver = DriverProfile(
            canonical_phone=canonical_phone,
            aliases=[alias],
            platforms=[platform],
            risk_score=0.0,
            blacklist_status="NONE",
            total_incidents=0
        )
        db.add(driver)
        db.flush()
        return driver

    @staticmethod
    def list_by_platform(
        db: Session,
        platform: str,
        skip: int = 0,
        limit: int = 50
    ) -> list[DriverProfile]:
        """
        Returns drivers who have at least one incident on the given platform.
        Uses PostgreSQL ANY operator for type-safe array membership.
        """
        return (
            db.query(DriverProfile)
            .filter(DriverProfile.platforms.any(platform))
            .order_by(DriverProfile.risk_score.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def list_all(
        db: Session,
        skip: int = 0,
        limit: int = 50
    ) -> list[DriverProfile]:
        return (
            db.query(DriverProfile)
            .order_by(DriverProfile.risk_score.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def update(db: Session, driver: DriverProfile) -> DriverProfile:
        db.add(driver)
        db.flush()
        return driver
