# ─────────────────────────────────────────────────────────────
# app/services/llm_service.py
# ─────────────────────────────────────────────────────────────
# Responsibilities:
#   • Load the Gemini API key from the environment
#   • Accept pre-retrieved RAG context (not raw transcript)
#   • Send the context to Google Gemini 2.5 Flash
#   • Return a clean, structured JSON summary string
# ─────────────────────────────────────────────────────────────

import os
# pyrefly: ignore [missing-import]
from google import genai
from dotenv import load_dotenv

# Load variables from backend/.env into os.environ
load_dotenv()

# ── Configure Gemini ──────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. "
        "Add it to backend/.env and restart the server."
    )

_client = genai.Client(api_key=GEMINI_API_KEY)

# ── Prompt template ───────────────────────────────────────────
# Receives `context` — the RAG-retrieved transcript sections —
# instead of the full raw transcript.
_SUMMARY_PROMPT = """
Analyze the following YouTube video transcript excerpts and return ONLY a valid JSON object.
No markdown, no code blocks, no explanation. Pure JSON only.

{{
  "title": "catchy title for this video content in max 8 words",
  "category": "single word — Tutorial / Lecture / Review / Documentary / News / Motivation",
  "tldr": "one punchy sentence max 15 words — what is this video about",
  "difficulty": "Beginner / Intermediate / Advanced",
  "estimated_watch_time": "X min watch",

  "core_content": {{
    "what_video_teaches": "one clear sentence — the exact main lesson this video delivers max 20 words",
    "key_concepts": [
      {{
        "concept": "concept name in 2-4 words",
        "explanation": "what it is in max 12 words simple plain english"
      }},
      {{
        "concept": "concept name in 2-4 words",
        "explanation": "what it is in max 12 words simple plain english"
      }},
      {{
        "concept": "concept name in 2-4 words",
        "explanation": "what it is in max 12 words simple plain english"
      }},
      {{
        "concept": "concept name in 2-4 words",
        "explanation": "what it is in max 12 words simple plain english"
      }}
    ],
    "biggest_takeaway": "single most important thing viewer should remember max 20 words"
  }},

  "main_topics": [
    {{
      "heading": "main topic heading in 3-5 words",
      "points": ["subpoint max 8 words", "subpoint max 8 words"]
    }},
    {{
      "heading": "main topic heading in 3-5 words",
      "points": ["subpoint max 8 words", "subpoint max 8 words"]
    }},
    {{
      "heading": "main topic heading in 3-5 words",
      "points": ["subpoint max 8 words", "subpoint max 8 words"]
    }}
  ],

  "what_you_will_learn": [
    "action verb + outcome max 8 words",
    "action verb + outcome max 8 words",
    "action verb + outcome max 8 words",
    "action verb + outcome max 8 words"
  ],

  "prerequisites": [
    "what user should already know",
    "what user should already know"
  ],

  "good_for": ["who this video is perfect for"],
  "not_for": ["who should skip this video"]
}}

Transcript excerpts (most relevant sections retrieved via semantic search):
{context}
""".strip()


async def summarize_transcript(context: str) -> str:
    """
    Send RAG-retrieved transcript context to Gemini and return
    a structured JSON summary string.

    Args:
        context: The top-k most relevant transcript chunks,
                 already retrieved and joined by rag_service.
                 This replaces the old full-transcript approach.

    Returns:
        A JSON-formatted summary string.

    Raises:
        RuntimeError: with a user-friendly message on any failure.
    """
    from app.services.gemini_queue import queued_gemini_call, GeminiFriendlyError

    prompt = _SUMMARY_PROMPT.format(context=context)

    try:
        def _call():
            response = _client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text.strip()

        summary = await queued_gemini_call(_call)
        return summary

    except GeminiFriendlyError as e:
        # Propagate user-friendly message, never raw API detail
        raise RuntimeError(e.message) from e

    except Exception:
        raise RuntimeError("Something went wrong. Please try again.") from None
