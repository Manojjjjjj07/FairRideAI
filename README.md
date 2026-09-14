# FairRide AI

AI-powered platform for detecting ride-hailing fare extortion, dynamic risk scoring, evidence package generation, and automated authority reporting.

## Tech Stack

- **Backend:** FastAPI (Python), SQLite / PostgreSQL (SQLAlchemy), Any AI API of dev choice
- **Frontend:** Next.js 15 (React 19, TypeScript), Tailwind CSS, Framer Motion

## Prerequisites

- Node.js 18+
- Python 3.10+

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=sqlite:///./fairride.db
SECRET_KEY=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
EVIDENCE_UPLOAD_DIR=uploads
```

Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
API docs available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend server:
```bash
npm run dev
```
App opens at `http://localhost:3000`.

## Project Structure

```
FairRideAI/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (auth, incidents, legal, risk)
│   │   ├── models/       # Database models
│   │   ├── services/     # AI analysis & PDF generation logic
│   │   └── main.py       # FastAPI entry point
│   ├── uploads/          # Local storage for incident evidence (git-ignored)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages & layouts
│   │   └── components/   # UI components
│   └── package.json
└── docs/                 # System documentation & user 
```