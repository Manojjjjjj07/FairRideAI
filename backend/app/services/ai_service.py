import json
import os
from datetime import datetime, timezone
from pathlib import Path
try:
    # pyrefly: ignore [missing-import]
    from PIL import Image
except ImportError:
    Image = None

try:
    # pyrefly: ignore [missing-import]
    from google import genai
except ImportError:
    genai = None

from app.core.config import settings


class AIService:

    PROMPT_TEMPLATE = """
You are an expert consumer protection AI investigator specialized in ride-hailing fare extortion, overcharging, and driver harassment in India (Uber, Ola, Rapido, Namma Yatri, InDrive).

Analyze the following reported incident and all attached evidence files carefully.

INCIDENT CASE FILE:
- Platform: {platform}
- Incident Type: {incident_type}
- Reported Severity: {severity}
- Location: {location}
- Stated App Fare: ₹{app_fare}
- Demanded / Paid Fare: ₹{demanded_fare}
- Captain / Vehicle Info: {captain_name} (Phone/Vehicle: {captain_phone})
- Incident Datetime: {incident_datetime}
- Commuter Description: {description}

EVIDENCE ATTACHMENTS:
- Total attached files: {evidence_count}

INSTRUCTIONS:
1. Examine the attached evidence images (app screenshots, payment receipts, ride trip details) alongside the commuter's reported claim.
2. Verify if the stated app fare matches what is visible in evidence screenshots.
3. Verify if the demanded or paid amount matches payment proof screenshots/receipts.
4. Confirm whether fare overcharging or extortion took place.
5. Calculate the exact overcharge gap in INR and percentage.
6. Draft a formal, professional Consumer Court Complaint Notice (~250-300 words) under the Indian Consumer Protection Act, 2019 (specifically referencing Section 2(9) for unfair trade practice & consumer rights violation) addressed to the ride aggregator company (e.g. {platform}).

OUTPUT REQUIREMENT:
Return ONLY a valid JSON object matching EXACTLY the following structure (no markdown formatting outside the JSON):

{{
  "fare_verification": {{
    "confirmed": true/false,
    "app_fare_from_evidence": number or null,
    "confidence": "HIGH" / "MEDIUM" / "LOW",
    "notes": "string detailing what was found in evidence"
  }},
  "payment_verification": {{
    "confirmed": true/false,
    "paid_amount_from_evidence": number or null,
    "confidence": "HIGH" / "MEDIUM" / "LOW",
    "notes": "string detailing what was found in evidence"
  }},
  "overcharge_confirmed": true/false,
  "overcharge_amount": number or null,
  "overcharge_percentage": number or null,
  "risk_assessment": "1-2 sentence executive summary of the violation and safety risk",
  "complaint_draft": "Full formal complaint draft string formatted with appropriate line breaks..."
}}
"""

    @classmethod
    def analyze_incident(cls, incident, evidences) -> tuple[bool, dict | None, str | None]:
        if genai is None or Image is None:
            return False, None, "Required AI dependencies missing. Run 'pip install google-genai pillow' in your virtual environment."

        if not settings.GEMINI_API_KEY:
            return False, None, "GEMINI_API_KEY is not configured in backend environment."


        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            # Build text prompt
            prompt_text = cls.PROMPT_TEMPLATE.format(
                platform=incident.platform or "Unknown Platform",
                incident_type=incident.incident_type or "Extortion",
                severity=incident.severity or "MEDIUM",
                location=incident.location or "Not specified",
                app_fare=incident.app_fare if incident.app_fare is not None else "N/A",
                demanded_fare=incident.demanded_fare if incident.demanded_fare is not None else "N/A",

                captain_name=incident.captain_name or "Not provided",
                captain_phone=incident.captain_phone or "Not provided",
                incident_datetime=str(incident.incident_datetime) if incident.incident_datetime else "N/A",
                description=incident.description or "No description provided.",
                evidence_count=len(evidences),
            )

            contents = [prompt_text]

            # Load image evidence files into contents
            image_extensions = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
            for ev in evidences:
                if ev.file_path and os.path.exists(ev.file_path):
                    ext = Path(ev.file_path).suffix.lower()
                    if ext in image_extensions:
                        try:
                            img = Image.open(ev.file_path)
                            contents.append(img)
                        except Exception:
                            pass

            # Call Gemini 3.8 Flash model
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=contents,
                config={"response_mime_type": "application/json"}
            )

            raw_text = response.text.strip()

            # Clean potential code block wrapping
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            parsed = json.loads(raw_text)
            return True, parsed, None

        except Exception as e:
            return False, None, str(e)
