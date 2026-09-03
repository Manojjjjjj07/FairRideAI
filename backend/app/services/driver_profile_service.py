"""
DriverProfileService — The Cross-Platform Driver Blacklist Engine

Core responsibilities:
  1. Normalize phone numbers (strip +91, spaces, dashes → 10 digits)
  2. Resolve an incident's captain_phone to a cross-platform DriverProfile
     (create if first time seen, update if known driver)
  3. Recalculate risk score across all linked incidents
  4. Auto-update blacklist_status based on risk thresholds

Risk Score Formula:
  base_weight: CRITICAL=10, HIGH=6, MEDIUM=3, LOW=1
  recency_multiplier: ≤30 days → 1.0, 30–90 days → 0.7, >90 days → 0.4
  cross_platform_bonus: 2+ platforms → +5, 3+ platforms → +10
  blacklist_status thresholds:
    < 10  → NONE
    10–24 → WATCHLIST
    ≥ 25  → BLACKLIST_RECOMMENDED  (human must confirm to BLACKLISTED)
"""
import re
from datetime import datetime, timezone, timedelta
from typing import Optional
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.models.driver_profile import DriverProfile
from app.repositories.driver_profile_repository import DriverProfileRepository


# Severity weights for risk scoring
SEVERITY_WEIGHTS = {
    "CRITICAL": 10,
    "HIGH": 6,
    "MEDIUM": 3,
    "LOW": 1,
}

# Risk score → auto blacklist status thresholds
WATCHLIST_THRESHOLD = 10
BLACKLIST_RECOMMENDED_THRESHOLD = 25


class DriverProfileService:

    @staticmethod
    def normalize_phone(raw_phone: str) -> Optional[str]:
        """
        Normalizes an Indian mobile phone number to a 10-digit string.
        Returns None if the number cannot be normalized to 10 digits.

        Examples:
          "+91 9998887776" → "9998887776"
          "99988 87776"   → "9998887776"
          "09998887776"   → "9998887776"
        """
        if not raw_phone:
            return None

        # Strip all non-numeric characters
        digits = re.sub(r"\D", "", raw_phone)

        # Remove leading 91 (country code) or 0
        if digits.startswith("91") and len(digits) == 12:
            digits = digits[2:]
        elif digits.startswith("0") and len(digits) == 11:
            digits = digits[1:]

        if len(digits) != 10:
            return None

        return digits

    @classmethod
    def resolve_driver(cls, db: Session, incident) -> Optional[DriverProfile]:
        """
        Auto-links an incident to the correct DriverProfile entity.

        1. Normalizes captain_phone
        2. Looks up driver_profiles by canonical_phone
        3. Creates a new profile if first time, or updates existing profile
        4. Links incident.driver_profile_id
        5. Recalculates risk score

        Returns the DriverProfile, or None if phone normalization fails.
        """
        canonical_phone = cls.normalize_phone(incident.captain_phone or "")
        if not canonical_phone:
            return None

        platform = incident.platform or "Unknown"
        alias = incident.captain_name or "Unknown"

        driver = DriverProfileRepository.get_by_phone(db, canonical_phone)

        if driver is None:
            # First time this phone is seen — create new driver profile
            driver = DriverProfileRepository.create(
                db,
                canonical_phone=canonical_phone,
                alias=alias,
                platform=platform
            )
        else:
            # Driver already known — update aliases and platforms
            aliases = list(driver.aliases or [])
            if alias and alias not in aliases:
                aliases.append(alias)
                driver.aliases = aliases

            platforms = list(driver.platforms or [])
            if platform not in platforms:
                platforms.append(platform)
                driver.platforms = platforms

        # Link this incident to the driver profile
        incident.driver_profile_id = driver.id

        # Recalculate risk score using ALL linked incidents after flush
        db.flush()
        cls._recalculate_risk_score(db, driver)

        return driver

    @classmethod
    def _recalculate_risk_score(cls, db: Session, driver: DriverProfile) -> None:
        """
        Recalculates risk_score and total_incidents for a DriverProfile
        based on all linked incidents, then updates blacklist_status.
        """
        from app.models.incident import Incident

        now = datetime.now(timezone.utc)
        incidents = (
            db.query(Incident)
            .filter(Incident.driver_profile_id == driver.id)
            .all()
        )

        total_score = 0.0
        for inc in incidents:
            weight = SEVERITY_WEIGHTS.get(inc.severity.upper(), 1)

            # Determine recency
            if inc.incident_datetime:
                # Make incident_datetime timezone-aware if it isn't
                inc_dt = inc.incident_datetime
                if inc_dt.tzinfo is None:
                    inc_dt = inc_dt.replace(tzinfo=timezone.utc)
                age_days = (now - inc_dt).days
            else:
                age_days = 0

            if age_days <= 30:
                multiplier = 1.0
            elif age_days <= 90:
                multiplier = 0.7
            else:
                multiplier = 0.4

            total_score += weight * multiplier

        # Cross-platform bonus
        platform_count = len(driver.platforms or [])
        if platform_count >= 3:
            total_score += 10
        elif platform_count >= 2:
            total_score += 5

        driver.risk_score = round(total_score, 2)
        driver.total_incidents = len(incidents)

        # Update blacklist status (only auto-status, not BLACKLISTED which needs human)
        if driver.blacklist_status == "BLACKLISTED":
            # Never auto-downgrade a human-confirmed blacklist
            pass
        elif total_score >= BLACKLIST_RECOMMENDED_THRESHOLD:
            driver.blacklist_status = "BLACKLIST_RECOMMENDED"
        elif total_score >= WATCHLIST_THRESHOLD:
            driver.blacklist_status = "WATCHLIST"
        else:
            driver.blacklist_status = "NONE"

        DriverProfileRepository.update(db, driver)

    @staticmethod
    def confirm_blacklist(
        db: Session,
        driver: DriverProfile,
        confirmed_by: str,
        note: str = ""
    ) -> DriverProfile:
        """
        Manually confirms a driver as BLACKLISTED.
        Called by operator or government portal endpoints.
        """
        driver.blacklist_status = "BLACKLISTED"
        driver.blacklisted_by = confirmed_by
        driver.blacklisted_at = datetime.now(timezone.utc)
        driver.blacklist_note = note
        return DriverProfileRepository.update(db, driver)

    @staticmethod
    def confirm_watchlist(
        db: Session,
        driver: DriverProfile,
        confirmed_by: str
    ) -> DriverProfile:
        """Manually moves driver to WATCHLIST status."""
        driver.blacklist_status = "WATCHLIST"
        driver.blacklisted_by = confirmed_by
        return DriverProfileRepository.update(db, driver)

    @staticmethod
    def clear_blacklist(
        db: Session,
        driver: DriverProfile,
        cleared_by: str
    ) -> DriverProfile:
        """Clears a driver from blacklist. Government only."""
        driver.blacklist_status = "NONE"
        driver.blacklisted_by = None
        driver.blacklisted_at = None
        driver.blacklist_note = f"Cleared by {cleared_by}"
        return DriverProfileRepository.update(db, driver)
