# pyrefly: ignore [missing-import]
from fastapi import FastAPI

app = FastAPI(
    title="FairRide AI",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "FairRide AI Backend Running"
    }