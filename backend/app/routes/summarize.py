# ─────────────────────────────────────────────────────────────
# app/routes/summarize.py
# ─────────────────────────────────────────────────────────────
# POST /api/v1/summarize
#   Body    : { "url": "https://www.youtube.com/watch?v=..." }
#   Response: { "summary": "..." }
#
# Pipeline (RAG-powered):
#   1. Extract video ID from URL
#   2. Fetch full transcript (youtube-transcript-api)
#   3. RAG: split → embed → FAISS index → retrieve top-k chunks
#   4. Pass retrieved chunks to Gemini for structured summary
#   5. Return JSON summary to frontend
# ─────────────────────────────────────────────────────────────

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.transcript_service import extract_video_id, get_transcript
from app.services.rag_service import build_rag_context
from app.services.llm_service import summarize_transcript

router = APIRouter()


# ── Request / Response models ─────────────────────────────────
class SummarizeRequest(BaseModel):
    """What the frontend sends to us."""
    url: str  # Accept as plain str for maximum URL flexibility


class SummarizeResponse(BaseModel):
    """What we send back to the frontend."""
    summary: str


# ── Endpoint ──────────────────────────────────────────────────
@router.post(
    "/summarize",
    response_model=SummarizeResponse,
    summary="Summarise a YouTube video",
    tags=["Summarize"],
)
async def summarize_video(request: SummarizeRequest):
    """
    RAG-powered YouTube video summarization.

    1. Extract the video ID from the provided YouTube URL.
    2. Fetch the video's transcript.
    3. Run the RAG pipeline:
         a. Split transcript into overlapping chunks
         b. Embed chunks with Google text-embedding-004
         c. Store in FAISS vector index
         d. Retrieve top-8 most relevant chunks via similarity search
    4. Send retrieved context to Gemini 2.5 Flash for summarization.
    5. Return the structured JSON summary.

    Raises:
        400  – URL is not a valid YouTube URL
        422  – Transcript cannot be fetched (captions disabled)
        503  – Gemini API error (rate limit, unavailable, etc.)
        500  – Unexpected server error
    """
    # ── Step 1: Extract video ID ──────────────────────────────
    try:
        video_id = extract_video_id(request.url)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid YouTube video URL."
        )

    # ── Step 2: Fetch transcript ──────────────────────────────
    try:
        transcript = get_transcript(video_id)
    except RuntimeError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
        )

    # ── Step 3: RAG pipeline — retrieve relevant chunks ───────
    try:
        rag_context = build_rag_context(transcript, top_k=8)
    except RuntimeError as e:
        # Embedding failed — fall back to truncated raw transcript
        # so the endpoint still works without RAG
        import logging
        logging.getLogger(__name__).warning(
            f"RAG pipeline failed, falling back to raw transcript: {e}"
        )
        MAX_CHARS = 40_000
        rag_context = (
            transcript[:MAX_CHARS] + "\n\n[Transcript truncated]"
            if len(transcript) > MAX_CHARS
            else transcript
        )

    # ── Step 4: Summarise with Gemini ─────────────────────────
    try:
        summary = await summarize_transcript(rag_context)
    except RuntimeError as e:
        # llm_service only raises friendly messages — forward as-is
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Something went wrong. Please try again."
        )

    # ── Step 5: Return result ─────────────────────────────────
    return SummarizeResponse(summary=summary)
