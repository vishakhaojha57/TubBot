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

from youtube_transcript_api import (
    YouTubeTranscriptApi,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)


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


# ── Reusable API client ───────────────────────────────────────
_api = YouTubeTranscriptApi()


def _fetch_transcript(video_id: str, languages: list[str] | None = None):
    """Support both the v0.x and v1.x youtube transcript APIs."""
    if hasattr(_api, "fetch"):
        if languages:
            return _api.fetch(video_id, languages=languages)
        return _api.fetch(video_id)

    # youtube-transcript-api 0.x exposes get_transcript as a class method.
    if languages:
        return YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
    return YouTubeTranscriptApi.get_transcript(video_id)


def get_transcript(video_id: str) -> str:
    """
    Fetch the English (or auto-generated) transcript for a video.

    Returns the transcript as a single string with sentences
    separated by spaces — ready to be sent to the LLM.

    Raises:
        RuntimeError: if no transcript is available (disabled or private video).
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Prefer manually-created English captions; fall back to auto-generated.
        logger.info(f"Fetching transcript for video_id: {video_id}")
        transcript = _fetch_transcript(
            video_id,
            languages=["en", "en-US", "en-GB"],
        )
        logger.info(f"Successfully fetched transcript with {len(transcript)} entries")
    except NoTranscriptFound as e:
        logger.warning(f"No English transcript found, trying any language: {e}")
        # Try getting any available transcript (may not be English)
        try:
            transcript = _fetch_transcript(video_id)
            logger.info(f"Fetched transcript in available language")
        except Exception as e:
            logger.error(f"Failed to fetch any transcript: {e}")
            raise RuntimeError(
                "No transcript found for this video. "
                "It may be auto-generated captions are disabled."
            ) from e
    except TranscriptsDisabled as e:
        logger.error(f"Transcripts are disabled: {e}")
        raise RuntimeError(
            "Transcripts are disabled for this video. "
            "Please try a different video."
        ) from e
    except VideoUnavailable as e:
        logger.error(f"Video is unavailable: {e}")
        raise RuntimeError(
            "This YouTube video is unavailable or has been removed. "
            "Please try a different video."
        ) from e
    except Exception as e:
        logger.error(f"Unexpected error fetching transcript: {e}")
        raise RuntimeError(
            "Unable to fetch this video's transcript right now. "
            "Please try again or use a different video."
        ) from e

    # v0.x returns dictionaries; v1.x returns snippet objects.
    full_text = " ".join(
        snippet.text if hasattr(snippet, "text") else snippet["text"]
        for snippet in transcript
    ).strip()
    if not full_text:
        raise RuntimeError("The video transcript is empty.")
    return full_text
