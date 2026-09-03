"""
Government Portal API — /government/

Scope: Full cross-platform view — all incidents, all drivers, all platforms.
Highest authority: can blacklist or clear any driver.
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.portal_auth import (
    require_government,
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
from pydantic import BaseModel

router = APIRouter(prefix="/government", tags=["Government Portal"])


# ─── Auth ────────────────────────────────────────────────────────────────────

class PortalRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    jurisdiction: str | None = None


class PortalLoginRequest(BaseModel):
    email: str
    password: str


@router.post("/auth/register")
def government_register(payload: PortalRegisterRequest, db: Session = Depends(get_db)):
    role, _ = resolve_portal_role(payload.email)
    if role != "GOVERNMENT":
        raise HTTPException(
            status_code=400,
            detail="Email domain not recognized as a government domain. "
                   "Use your official government email (e.g. you@gov.in)."
        )

    existing = db.query(PortalUser).filter(PortalUser.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = PortalUser(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="GOVERNMENT",
        jurisdiction=payload.jurisdiction,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Government account created", "jurisdiction": payload.jurisdiction}


@router.post("/auth/login")
def government_login(payload: PortalLoginRequest, db: Session = Depends(get_db)):
    role, _ = resolve_portal_role(payload.email)
    if role != "GOVERNMENT":
        raise HTTPException(status_code=403, detail="Not a government email domain.")

    user = db.query(PortalUser).filter(
        PortalUser.email == payload.email,
        PortalUser.role == "GOVERNMENT"
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive.")

    token = create_portal_token(user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "GOVERNMENT",
        "jurisdiction": user.jurisdiction
    }


@router.get("/auth/me")
def government_me(portal_user: PortalUser = Depends(require_government)):
    return {
        "id": str(portal_user.id),
        "name": portal_user.name,
        "email": portal_user.email,
        "role": portal_user.role,
        "jurisdiction": portal_user.jurisdiction,
    }


# ─── Dashboard Stats ─────────────────────────────────────────────────────────

@router.get("/dashboard/stats")
def government_stats(
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    total_incidents     = db.query(func.count(Incident.id)).scalar() or 0
    total_drivers       = db.query(func.count(DriverProfile.id)).scalar() or 0
    watchlist_count     = db.query(func.count(DriverProfile.id)).filter(DriverProfile.blacklist_status == "WATCHLIST").scalar() or 0
    recommended         = db.query(func.count(DriverProfile.id)).filter(DriverProfile.blacklist_status == "BLACKLIST_RECOMMENDED").scalar() or 0
    blacklisted         = db.query(func.count(DriverProfile.id)).filter(DriverProfile.blacklist_status == "BLACKLISTED").scalar() or 0
    routed_govt         = db.query(func.count(Incident.id)).filter(Incident.routed_to_government == True).scalar() or 0

    # Per-platform breakdown
    platform_counts = (
        db.query(Incident.platform, func.count(Incident.id))
        .group_by(Incident.platform)
        .all()
    )

    return {
        "total_incidents": total_incidents,
        "total_drivers_tracked": total_drivers,
        "watchlist_count": watchlist_count,
        "blacklist_recommended": recommended,
        "blacklisted": blacklisted,
        "routed_to_government": routed_govt,
        "platform_breakdown": [
            {"platform": p, "incident_count": c} for p, c in platform_counts
        ]
    }


# ─── Drivers ─────────────────────────────────────────────────────────────────

@router.get("/drivers/")
def list_all_drivers(
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    query = db.query(DriverProfile)
    if status_filter:
        query = query.filter(DriverProfile.blacklist_status == status_filter.upper())

    drivers = query.order_by(DriverProfile.risk_score.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": str(d.id),
            "canonical_phone": d.canonical_phone,
            "aliases": d.aliases,
            "platforms": d.platforms,
            "risk_score": d.risk_score,
            "blacklist_status": d.blacklist_status,
            "total_incidents": d.total_incidents,
            "blacklisted_at": d.blacklisted_at,
            "blacklisted_by": d.blacklisted_by,
        }
        for d in drivers
    ]


@router.get("/drivers/{driver_id}")
def get_driver_full(
    driver_id: uuid.UUID,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    driver = DriverProfileRepository.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    all_incidents = (
        db.query(Incident)
        .filter(Incident.driver_profile_id == driver_id)
        .order_by(Incident.incident_datetime.desc())
        .all()
    )

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
        "all_incidents": [
            {
                "id": str(i.id),
                "platform": i.platform,
                "incident_type": i.incident_type,
                "severity": i.severity,
                "description": i.description,
                "location": i.location,
                "incident_datetime": i.incident_datetime,
                "app_fare": i.app_fare,
                "demanded_fare": i.demanded_fare,
                "captain_name": i.captain_name,
                "captain_phone": i.captain_phone,
                "vehicle_number": i.vehicle_number,
                "ai_analysis_status": i.ai_analysis_status,
                "routed_to_operator": i.routed_to_operator,
                "routed_to_government": i.routed_to_government,
            }
            for i in all_incidents
        ]
    }


@router.post("/drivers/{driver_id}/blacklist")
def government_blacklist_driver(
    driver_id: uuid.UUID,
    note: str = "",
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    driver = DriverProfileRepository.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    DriverProfileService.confirm_blacklist(db, driver, confirmed_by=portal_user.email, note=note)
    db.commit()
    return {"message": "Driver BLACKLISTED by government authority", "driver_id": str(driver_id)}


@router.post("/drivers/{driver_id}/clear")
def government_clear_driver(
    driver_id: uuid.UUID,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    driver = DriverProfileRepository.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    DriverProfileService.clear_blacklist(db, driver, cleared_by=portal_user.email)
    db.commit()
    return {"message": "Driver cleared from blacklist", "driver_id": str(driver_id)}


CITY_COORDINATES: dict[str, tuple[float, float]] = {
    "peelamedu": (11.0284, 77.0031),
    "coimbatore": (11.0168, 76.9558),
    "gandhipuram": (11.0183, 76.9644),
    "chennai airport": (12.9806, 80.1638),
    "chennai": (13.0827, 80.2707),
    "guindy": (13.0067, 80.2020),
    "velachery": (12.9759, 80.2212),
    "t nagar": (13.0418, 80.2341),
    "bangalore": (12.9716, 77.5946),
    "bengaluru": (12.9716, 77.5946),
    "koramangala": (12.9352, 77.6245),
    "indiranagar": (12.9784, 77.6408),
    "whitefield": (12.9698, 77.7500),
    "hyderabad": (17.3850, 78.4867),
    "hitech city": (17.4435, 78.3772),
    "mumbai": (19.0760, 72.8777),
    "andheri": (19.1197, 72.8464),
    "delhi": (28.6139, 77.2090),
    "gurgaon": (28.4595, 77.0266),
    "noida": (28.5355, 77.3910),
    "pune": (18.5204, 73.8567),
    "kochi": (9.9312, 76.2673),
    "trivandrum": (8.5241, 76.9366),
}


def resolve_coords(location_str: str | None, lat: float | None, lng: float | None) -> tuple[float | None, float | None]:
    if lat is not None and lng is not None:
        return lat, lng
    if not location_str:
        return None, None
    loc_lower = location_str.lower()
    for key, coords in CITY_COORDINATES.items():
        if key in loc_lower:
            return coords
    return None, None


# ─── Heatmap ─────────────────────────────────────────────────────────────────

@router.get("/heatmap/")
def get_heatmap_data(
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    """Returns all incidents with lat/lng for Leaflet heatmap rendering."""
    incidents = db.query(Incident).all()
    points = []
    for i in incidents:
        lat, lng = resolve_coords(i.location, i.latitude, i.longitude)
        if lat is not None and lng is not None:
            points.append({
                "id": str(i.id),
                "lat": lat,
                "lng": lng,
                "platform": i.platform,
                "severity": i.severity,
                "incident_type": i.incident_type,
                "location": i.location or "Unknown Location",
            })
    return points


# ─── Platform Compliance ─────────────────────────────────────────────────────

@router.get("/platforms/compliance/")
def platform_compliance(
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    """Per-platform incident and driver stats for compliance scorecards."""
    platform_data = (
        db.query(Incident.platform, func.count(Incident.id))
        .group_by(Incident.platform)
        .all()
    )

    result = []
    for platform, incident_count in platform_data:
        routed = (
            db.query(func.count(Incident.id))
            .filter(Incident.platform == platform, Incident.routed_to_government == True)
            .scalar() or 0
        )
        blacklisted_active = (
            db.query(func.count(DriverProfile.id))
            .filter(
                DriverProfile.platforms.any(platform),
                DriverProfile.blacklist_status == "BLACKLISTED"
            )
            .scalar() or 0
        )
        result.append({
            "platform": platform,
            "total_incidents": incident_count,
            "routed_to_government": routed,
            "blacklisted_drivers_active": blacklisted_active,
        })

    return sorted(result, key=lambda x: x["total_incidents"], reverse=True)


# ─── All Incidents ────────────────────────────────────────────────────────────

@router.get("/incidents/")
def list_all_incidents(
    skip: int = 0,
    limit: int = 50,
    platform: str | None = None,
    severity: str | None = None,
    routed_only: bool = False,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    query = db.query(Incident)
    if platform:
        query = query.filter(Incident.platform == platform)
    if severity:
        query = query.filter(Incident.severity == severity.upper())
    if routed_only:
        query = query.filter(Incident.routed_to_government == True)

    incidents = query.order_by(Incident.incident_datetime.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": str(i.id),
            "platform": i.platform,
            "incident_type": i.incident_type,
            "severity": i.severity,
            "location": i.location,
            "incident_datetime": i.incident_datetime,
            "captain_name": i.captain_name,
            "captain_phone": i.captain_phone,
            "app_fare": i.app_fare,
            "demanded_fare": i.demanded_fare,
            "status": i.status,
            "routed_to_operator": i.routed_to_operator,
            "routed_to_government": i.routed_to_government,
            "driver_profile_id": str(i.driver_profile_id) if i.driver_profile_id else None,
        }
        for i in incidents
    ]


# ─── Intelligence Reports ─────────────────────────────────────────────────────

@router.get("/reports/")
def list_reports(
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    from app.models.intelligence_report import IntelligenceReport
    reports = (
        db.query(IntelligenceReport)
        .filter(IntelligenceReport.target_audience == "GOVERNMENT")
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


class GenerateGovReportRequest(BaseModel):
    report_type: str = "MONTHLY"  # 'WEEKLY' or 'MONTHLY'
    platform: str | None = None   # None = all platforms


@router.post("/reports/generate")
def generate_government_report(
    payload: GenerateGovReportRequest,
    db: Session = Depends(get_db),
    portal_user: PortalUser = Depends(require_government)
):
    from app.services.report_service import ReportService
    report = ReportService.generate_report(
        db=db,
        report_type=payload.report_type,
        target_audience="GOVERNMENT",
        platform=payload.platform
    )
    return {
        "message": f"National {payload.report_type.upper()} report generated successfully",
        "report_id": str(report.id),
        "total_incidents": report.total_incidents,
        "period_start": str(report.period_start),
        "period_end": str(report.period_end),
        "ai_brief": report.ai_brief,
    }

