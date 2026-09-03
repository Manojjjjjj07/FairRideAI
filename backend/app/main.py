# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.incidents import router as incident_router
from app.api.v1.evidence import (
    router as evidence_router
)
from app.api.v1.analysis import (
    router as analysis_router
)
from app.api.v1.operator import router as operator_router
from app.api.v1.government import router as government_router
from app.api.v1.routing import router as routing_router


app = FastAPI(
    title="FairRide AI",
    version="1.0.0"
)

# Allow Next.js dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(evidence_router)
app.include_router(analysis_router)
app.include_router(operator_router)
app.include_router(government_router)
app.include_router(routing_router)



@app.get("/")
def root():
    return {
        "message": "FairRide AI Backend Running"
    }