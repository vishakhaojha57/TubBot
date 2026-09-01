# ─────────────────────────────────────────────────────────────
# app/services/transcript_service.py
# ─────────────────────────────────────────────────────────────
# Responsibilities:
#   • Parse any valid YouTube URL format and extract the video ID
#   • Fetch the English transcript using youtube-transcript-api
#   • Return the transcript as a single plain-text string
# ─────────────────────────────────────────────────────────────

import re
from urllib.parse import urlparse, parse_qs

from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled


def extract_video_id(url: str) -> str:
    """
    Extract the YouTube video ID from any common URL format:
      - https://www.youtube.com/watch?v=VIDEO_ID
      - https://youtu.be/VIDEO_ID
      - https://www.youtube.com/embed/VIDEO_ID
      - https://www.youtube.com/shorts/VIDEO_ID

    Raises:
        ValueError: if no video ID can be found in the URL.
    """
    # ── youtu.be short links ──────────────────────────────────
    parsed = urlparse(url)

    if parsed.netloc in ("youtu.be", "www.youtu.be"):
        # Path is /VIDEO_ID (strip the leading slash)
        video_id = parsed.path.lstrip("/").split("?")[0]
        if video_id:
            return video_id

    # ── Standard youtube.com URLs ─────────────────────────────
    if parsed.netloc in (
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    ):
        # watch?v=...
        qs = parse_qs(parsed.query)
        if "v" in qs:
            return qs["v"][0]

        # /embed/VIDEO_ID  or  /shorts/VIDEO_ID
        path_parts = parsed.path.split("/")
        for keyword in ("embed", "shorts", "v"):
            if keyword in path_parts:
                idx = path_parts.index(keyword)
                if idx + 1 < len(path_parts) and path_parts[idx + 1]:
                    return path_parts[idx + 1]

    # ── Last-resort: look for an 11-char video ID anywhere ────
    match = re.search(r"(?:v=|/)([0-9A-Za-z_-]{11})", url)
    if match:
        return match.group(1)

    raise ValueError(f"Could not extract a YouTube video ID from: {url!r}")


# ── Reusable API client (youtube-transcript-api v1.x) ─────────
_api = YouTubeTranscriptApi()


def get_transcript(video_id: str) -> str:
    """
    Fetch the English (or auto-generated) transcript for a video.

    Returns the transcript as a single string with sentences
    separated by spaces — ready to be sent to the LLM.

    Raises:
        RuntimeError: if no transcript is available (disabled or private video).
    """
    try:
        # Prefer manually-created English captions; fall back to auto-generated.
        # v1.x API: instance method .fetch() returns FetchedTranscript
        # (an iterable of FetchedTranscriptSnippet dataclass objects).
        transcript = _api.fetch(
            video_id,
            languages=["en", "en-US", "en-GB"],
        )
    except NoTranscriptFound:
        # Try getting any available transcript (may not be English)
        try:
            transcript = _api.fetch(video_id)
        except Exception as e:
            raise RuntimeError(
                "No transcript found for this video. "
                "It may be auto-generated captions are disabled."
            ) from e
    except TranscriptsDisabled:
        raise RuntimeError(
            "Transcripts are disabled for this video. "
            "Please try a different video."
        )
    except Exception as e:
        raise RuntimeError(f"Failed to fetch transcript: {e}") from e

    # Join all caption snippets into one continuous string.
    # v1.x: each entry is a FetchedTranscriptSnippet with a .text attribute.
    full_text = " ".join(snippet.text for snippet in transcript)
    return full_text
