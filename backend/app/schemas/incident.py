from datetime import datetime
# pyrefly: ignore [missing-import]
from pydantic import BaseModel


class IncidentCreateRequest(BaseModel):

    incident_type: str

    severity: str

    description: str

    platform: str

    captain_name: str | None = None

    captain_phone: str | None = None

    app_fare: float | None = None

    demanded_fare: float | None = None

    incident_datetime: datetime

    location: str

    latitude: float | None = None

    longitude: float | None = None


class IncidentResponse(BaseModel):

    id: str

    incident_type: str

    severity: str

    description: str

    platform: str

    location: str

    latitude: float | None = None

    longitude: float | None = None

    status: str