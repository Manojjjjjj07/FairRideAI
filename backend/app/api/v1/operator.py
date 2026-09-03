"""
Operator Portal API — /operator/

Scope: Only incidents and drivers linked to the authenticated operator's platform.
Cross-platform data exposed as a count/flag only (not full details).
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.portal_auth import (
    require_operator,
    get_current_portal_user,
    hash_password,
    verify_password,
    create_portal_token,
    resolve_portal_role,
)
from app.db.dependencies import get_db
from app.models.portal_user import PortalUser
from app.models.incident import Incident
from app.models.driver_profile import DriverProfile
from app.repositories.driver_profile_repository import DriverProfileRepository
from app.services.driver_profile_service import DriverProfileService
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/operator", tags=["Operator Portal"])


# ─── Auth ────────────────────────────────────────────────────────────────────

class PortalRegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class PortalLoginRequest(BaseModel):
    email: str
    password: str


@router.post("/auth/register")
def operator_register(payload: PortalRegisterRequest, db: Session = Depends(get_db)):
    role, platform = resolve_portal_role(payload.email)
    if role != "OPERATOR":
        raise HTTPException(
            status_code=400,
            detail="Email domain not recognized as an operator domain. "
                   "Use your company email (e.g. you@rapido.com)."
        )

    existing = db.query(PortalUser).filter(PortalUser.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = PortalUser(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="OPERATOR",
        platform=platform,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": f"Operator account created for {platform}", "platform": platform}


@router.post("/auth/login")
def operator_login(payload: PortalLoginRequest, db: Session = Depends(get_db)):
    role, platform = resolve_portal_role(payload.email)
    if role != "OPERATOR":
        raise HTTPException(status_code=403, detail="Not an operator email domain.")

    user = db.query(PortalUser).filter(
        PortalUser.email == payload.email,
        PortalUser.role == "OPERATOR"
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive.")

    token = create_portal_token(user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "OPERATOR",
        "platform": user.platform
    }


@router.get("/auth/me")
def operator_me(portal_user: PortalUser = Depends(require_operator)):
    return {
        "id": str(portal_user.id),
        "name": portal_user.name,
        "email": portal_user.email,
        "role": portal_user.role,
        "platform": portal_user.platform,
    }


# ─── Dashboard Stats ─────────────────────────────────────────────────────────

@router.get("/dashboard/stats")
def operator_stats(
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_operator)
):
    platform = portal_user.platform

    total_incidents = (
        db.query(func.count(Incident.id))
        .filter(Incident.platform == platform)
        .scalar() or 0
    )

    routed_complaints = (
        db.query(func.count(Incident.id))
        .filter(Incident.platform == platform, Incident.routed_to_operator == True)
        .scalar() or 0
    )

    watchlist_count = (
        db.query(func.count(DriverProfile.id))
        .filter(DriverProfile.platforms.any(platform))
        .filter(DriverProfile.blacklist_status == "WATCHLIST")
        .scalar() or 0
    )

    blacklist_recommended = (
        db.query(func.count(DriverProfile.id))
        .filter(DriverProfile.platforms.any(platform))
        .filter(DriverProfile.blacklist_status == "BLACKLIST_RECOMMENDED")
        .scalar() or 0
    )

    blacklisted = (
        db.query(func.count(DriverProfile.id))
        .filter(DriverProfile.platforms.any(platform))
        .filter(DriverProfile.blacklist_status == "BLACKLISTED")
        .scalar() or 0
    )

    return {
        "platform": platform,
        "total_incidents": total_incidents,
        "routed_complaints": routed_complaints,
        "watchlist_count": watchlist_count,
        "blacklist_recommended": blacklist_recommended,
        "blacklisted": blacklisted,
    }


# ─── Drivers ─────────────────────────────────────────────────────────────────

@router.get("/drivers/")
def list_drivers(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_operator)
):
    platform = portal_user.platform
    drivers = DriverProfileRepository.list_by_platform(db, platform, skip=skip, limit=limit)

    result = []
    for d in drivers:
        platform_incident_count = (
            db.query(func.count(Incident.id))
            .filter(Incident.driver_profile_id == d.id, Incident.platform == platform)
            .scalar() or 0
        )
        cross_platform_count = max(0, d.total_incidents - platform_incident_count)

        result.append({
            "id": str(d.id),
            "canonical_phone": d.canonical_phone,
            "aliases": d.aliases,
            "platform_incidents": platform_incident_count,
            "cross_platform_incidents": cross_platform_count,
            "cross_platform_flag": cross_platform_count > 0,
            "other_platforms": [p for p in (d.platforms or []) if p != platform],
            "risk_score": d.risk_score,
            "blacklist_status": d.blacklist_status,
        })

    return result


@router.get("/drivers/{driver_id}")
def get_driver(
    driver_id: uuid.UUID,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_operator)
):
    platform = portal_user.platform
    driver = DriverProfileRepository.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    platform_incidents = (
        db.query(Incident)
        .filter(Incident.driver_profile_id == driver_id, Incident.platform == platform)
        .order_by(Incident.incident_datetime.desc())
        .all()
    )

    cross_platform_count = max(0, driver.total_incidents - len(platform_incidents))

    return {
        "id": str(driver.id),
        "canonical_phone": driver.canonical_phone,
        "aliases": driver.aliases,
        "platforms": driver.platforms,
        "risk_score": driver.risk_score,
        "blacklist_status": driver.blacklist_status,
        "total_incidents": driver.total_incidents,
        "blacklisted_at": driver.blacklisted_at,
        "blacklisted_by": driver.blacklisted_by,
        "blacklist_note": driver.blacklist_note,
        "cross_platform_count": cross_platform_count,
        "cross_platform_flag": cross_platform_count > 0,
        "other_platforms": [p for p in (driver.platforms or []) if p != platform],
        "platform_incidents": [
            {
                "id": str(i.id),
                "incident_type": i.incident_type,
                "severity": i.severity,
                "description": i.description,
                "location": i.location,
                "incident_datetime": i.incident_datetime,
                "app_fare": i.app_fare,
                "demanded_fare": i.demanded_fare,
                "vehicle_number": i.vehicle_number,
                "ai_analysis_status": i.ai_analysis_status,
                "routed_to_operator": i.routed_to_operator,
                "routed_to_government": i.routed_to_government,
            }
            for i in platform_incidents
        ]
    }


@router.post("/drivers/{driver_id}/watchlist")
def watchlist_driver(
    driver_id: uuid.UUID,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_operator)
):
    driver = DriverProfileRepository.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if portal_user.platform not in (driver.platforms or []):
        raise HTTPException(status_code=403, detail="Driver not on your platform")

    DriverProfileService.confirm_watchlist(db, driver, confirmed_by=portal_user.email)
    db.commit()
    return {"message": "Driver moved to WATCHLIST", "driver_id": str(driver_id)}


@router.post("/drivers/{driver_id}/blacklist")
def blacklist_driver(
    driver_id: uuid.UUID,
    note: str = "",
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_operator)
):
    driver = DriverProfileRepository.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if portal_user.platform not in (driver.platforms or []):
        raise HTTPException(status_code=403, detail="Driver not on your platform")

    DriverProfileService.confirm_blacklist(db, driver, confirmed_by=portal_user.email, note=note)
    db.commit()
    return {"message": "Driver BLACKLISTED", "driver_id": str(driver_id)}


# ─── Incidents ───────────────────────────────────────────────────────────────

@router.get("/incidents/")
def list_incidents(
    skip: int = 0,
    limit: int = 50,
    routed_only: bool = False,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_operator)
):
    query = db.query(Incident).filter(Incident.platform == portal_user.platform)
    if routed_only:
        query = query.filter(Incident.routed_to_operator == True)

    incidents = query.order_by(Incident.incident_datetime.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": str(i.id),
            "incident_type": i.incident_type,
            "severity": i.severity,
            "platform": i.platform,
            "location": i.location,
            "incident_datetime": i.incident_datetime,
            "app_fare": i.app_fare,
            "demanded_fare": i.demanded_fare,
            "captain_name": i.captain_name,
            "captain_phone": i.captain_phone,
            "vehicle_number": i.vehicle_number,
            "status": i.status,
            "ai_analysis_status": i.ai_analysis_status,
            "routed_to_operator": i.routed_to_operator,
            "routed_to_government": i.routed_to_government,
            "driver_profile_id": str(i.driver_profile_id) if i.driver_profile_id else None,
        }
        for i in incidents
    ]


# ─── Reports ─────────────────────────────────────────────────────────────────

@router.get("/reports/")
def list_reports(
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_operator)
):
    from app.models.intelligence_report import IntelligenceReport
    reports = (
        db.query(IntelligenceReport)
        .filter(
            IntelligenceReport.target_audience == "OPERATOR",
            IntelligenceReport.platform == portal_user.platform
        )
        .order_by(IntelligenceReport.generated_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": str(r.id),
            "report_type": r.report_type,
            "period_start": str(r.period_start),
            "period_end": str(r.period_end),
            "total_incidents": r.total_incidents,
            "new_watchlist": r.new_watchlist,
            "new_blacklisted": r.new_blacklisted,
            "ai_brief": r.ai_brief,
            "generated_at": r.generated_at,
        }
        for r in reports
    ]


class GenerateReportRequest(BaseModel):
    report_type: str = "WEEKLY"  # 'WEEKLY' or 'MONTHLY'


@router.post("/reports/generate")
def generate_operator_report(
    payload: GenerateReportRequest,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_operator)
):
    from app.services.report_service import ReportService
    report = ReportService.generate_report(
        db=db,
        report_type=payload.report_type,
        target_audience="OPERATOR",
        platform=portal_user.platform
    )
    return {
        "message": f"{payload.report_type.upper()} report generated successfully for {portal_user.platform}",
        "report_id": str(report.id),
        "total_incidents": report.total_incidents,
        "period_start": str(report.period_start),
        "period_end": str(report.period_end),
        "ai_brief": report.ai_brief,
    }

