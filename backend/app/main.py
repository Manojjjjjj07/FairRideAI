# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from app.api.v1.auth import router as auth_router
from app.api.v1.incidents import router as incident_router
from app.api.v1.evidence import (
    router as evidence_router
)

app = FastAPI(
    title="FairRide AI",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(evidence_router)

@app.get("/")
def root():
    return {
        "message": "FairRide AI Backend Running"
    }