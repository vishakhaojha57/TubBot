# ─────────────────────────────────────────────────────────────
# app/main.py  —  FastAPI application entry point
# ─────────────────────────────────────────────────────────────
# Responsibilities:
#   • Create the FastAPI app instance
#   • Configure CORS so the React frontend can call the API
#   • Register all route blueprints
# ─────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.summarize import router as summarize_router

# ── App instance ──────────────────────────────────────────────
app = FastAPI(
    title="YouTube AI Chatbot API",
    description="Summarise YouTube videos instantly with AI.",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",              # Vite dev server default
        "http://localhost:3000",              # CRA / alternative dev server
        "https://your-app-name.vercel.app",   # Production frontend (Vercel)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────
app.include_router(summarize_router, prefix="/api/v1")


# ── Health-check ──────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    """Simple ping endpoint — confirms the server is running."""
    return {"status": "ok", "message": "TubBot API is running 🚀"}
