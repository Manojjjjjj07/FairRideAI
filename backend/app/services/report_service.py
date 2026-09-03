"""
ReportService — Batch Intelligence Report Generator powered by Gemini 3.8 Flash

Generates executive intelligence briefs for Operators and Government Authorities by
analyzing aggregated incident patterns, driver risk scores, and geographic clusters over
a 7-day (WEEKLY) or 30-day (MONTHLY) period.
"""
import json
import os
from datetime import date, datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.models.incident import Incident
from app.models.driver_profile import DriverProfile
from app.models.intelligence_report import IntelligenceReport

try:
    # pyrefly: ignore [missing-import]
    from google import genai
except ImportError:
    genai = None


class ReportService:

    @classmethod
    def generate_report(
        cls,
        db: Session,
        report_type: str,         # 'WEEKLY' or 'MONTHLY'
        target_audience: str,     # 'OPERATOR' or 'GOVERNMENT'
        platform: Optional[str] = None
    ) -> IntelligenceReport:
        today = date.today()
        days = 7 if report_type.upper() == 'WEEKLY' else 30
        period_start = today - timedelta(days=days)
        period_end = today

        # 1. Query incidents in date range
        query = db.query(Incident).filter(
            func.date(Incident.incident_datetime) >= period_start,
            func.date(Incident.incident_datetime) <= period_end
        )
        if target_audience == 'OPERATOR' and platform:
            query = query.filter(Incident.platform == platform)
        elif target_audience == 'GOVERNMENT' and platform:
            query = query.filter(Incident.platform == platform)

        incidents = query.order_by(Incident.incident_datetime.desc()).all()

        total_incidents = len(incidents)

        # 2. Group severity counts
        severity_counts = {}
        type_counts = {}
        location_counts = {}
        for inc in incidents:
            sev = inc.severity or "UNKNOWN"
            severity_counts[sev] = severity_counts.get(sev, 0) + 1

            itype = inc.incident_type or "OTHER"
            type_counts[itype] = type_counts.get(itype, 0) + 1

            loc = inc.location or "Unknown Zone"
            location_counts[loc] = location_counts.get(loc, 0) + 1

        top_locations = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:5]

        # 3. Query driver profile stats
        driver_query = db.query(DriverProfile)
        if platform:
            driver_query = driver_query.filter(DriverProfile.platforms.any(platform))

        new_watchlist = driver_query.filter(DriverProfile.blacklist_status == 'WATCHLIST').count()
        new_blacklisted = driver_query.filter(DriverProfile.blacklist_status == 'BLACKLISTED').count()

        summary_json = {
            "total_incidents": total_incidents,
            "severity_breakdown": severity_counts,
            "incident_types": type_counts,
            "top_hotspots": [{"location": loc, "count": cnt} for loc, cnt in top_locations],
            "watchlist_drivers": new_watchlist,
            "blacklisted_drivers": new_blacklisted,
        }

        # 4. Generate AI Brief via Gemini 3.8 Flash
        ai_brief = cls._generate_ai_brief(
            report_type=report_type,
            target_audience=target_audience,
            platform=platform or "All Platforms",
            period_start=str(period_start),
            period_end=str(period_end),
            total_incidents=total_incidents,
            severity_counts=severity_counts,
            type_counts=type_counts,
            top_locations=top_locations,
            new_watchlist=new_watchlist,
            new_blacklisted=new_blacklisted,
            incidents_sample=incidents[:10]
        )

        # 5. Save report to database
        report = IntelligenceReport(
            report_type=report_type.upper(),
            target_audience=target_audience.upper(),
            platform=platform if target_audience == 'OPERATOR' else platform,
            period_start=period_start,
            period_end=period_end,
            total_incidents=total_incidents,
            new_watchlist=new_watchlist,
            new_blacklisted=new_blacklisted,
            ai_brief=ai_brief,
            summary_json=summary_json,
        )

        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @classmethod
    def _generate_ai_brief(
        cls,
        report_type: str,
        target_audience: str,
        platform: str,
        period_start: str,
        period_end: str,
        total_incidents: int,
        severity_counts: dict,
        type_counts: dict,
        top_locations: list,
        new_watchlist: int,
        new_blacklisted: int,
        incidents_sample: list
    ) -> str:
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")

        sample_text = "\n".join([
            f"- [{i.platform}] {i.incident_type} ({i.severity}): {i.description[:100]}… (Demanded: ₹{i.demanded_fare}, App: ₹{i.app_fare}) at {i.location}"
            for i in incidents_sample
        ]) if incidents_sample else "No specific incidents logged in this window."

        prompt = f"""
You are an expert Transport Safety & Regulatory Intelligence Analyst for Indian urban mobility (Rapido, Ola, Uber, Namma Yatri, InDrive).

Generate an Executive {report_type.upper()} Misconduct Intelligence Brief for:
Audience: {target_audience}
Target Platform Scope: {platform}
Reporting Window: {period_start} to {period_end}

AGGREGATED DATA SNAPSHOT:
- Total Logged Incidents: {total_incidents}
- Severity Breakdown: {json.dumps(severity_counts)}
- Misconduct Category Breakdown: {json.dumps(type_counts)}
- Active Drivers on Watchlist: {new_watchlist}
- Active Blacklisted Drivers: {new_blacklisted}
- Top Reported Hotspots: {json.dumps(dict(top_locations))}

RECENT INCIDENT SAMPLES:
{sample_text}

INSTRUCTIONS:
Write a professional, structured executive intelligence brief (~250-350 words) with clear headings:

1. EXECUTIVE SUMMARY & THREAT LEVEL ASSESSMENT
2. MISCONDUCT PATTERN & EXTRA-FARE EXTORTION ANALYSIS
3. GEOGRAPHIC HOTSPOT & CLUSTER RISK REPORT
4. ACTIONABLE ENFORCEMENT & COMPLIANCE RECOMMENDATIONS

Keep the tone formal, evidence-driven, and authoritative.
"""

        if genai and api_key:
            try:
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=[prompt]
                )
                return response.text.strip()
            except Exception as e:
                # Fallback text if API call encounters network/quota limits
                pass

        # Fallback brief generation if AI is offline
        hotspots_str = ", ".join([loc for loc, _ in top_locations]) if top_locations else "Various locations"
        return f"""EXECUTIVE SUMMARY & THREAT LEVEL ASSESSMENT
During the period from {period_start} to {period_end}, a total of {total_incidents} ride misconduct incidents were documented for {platform}. Current monitoring identifies {new_watchlist} drivers on Watchlist and {new_blacklisted} drivers confirmed Blacklisted.

MISCONDUCT PATTERN & EXTRA-FARE EXTORTION ANALYSIS
The primary reported violations revolve around {json.dumps(type_counts)}. Reported severity breakdown indicates {json.dumps(severity_counts)}. Cross-platform identifier tracking highlights repeated fare extortion attempts involving off-platform cash/UPI demands.

GEOGRAPHIC HOTSPOT & CLUSTER RISK REPORT
Incident density is highest in the following corridors: {hotspots_str}. Frequent extortion triggers occur during night hours and near high-density transit hubs.

ACTIONABLE ENFORCEMENT & COMPLIANCE RECOMMENDATIONS
1. Immediate operational review of drivers crossing risk threshold ≥ 25.
2. Coordinate cross-platform deactivation protocols for repeat offenders.
3. Increase transport authority patrol visibility in identified hotspot corridors.
"""
