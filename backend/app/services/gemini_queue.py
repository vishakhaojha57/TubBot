# ─────────────────────────────────────────────────────────────
# app/services/gemini_queue.py
# ─────────────────────────────────────────────────────────────
# Centralized Gemini API call wrapper with:
#   • Request queue  – only 1 Gemini call at a time
#   • Per-mode gap   – 3s for chat, 15s for summarize
#   • Queue cap      – max 10 queued requests, reject beyond that
#   • Auto retry     – on 429/503, retry up to 3×
#   • Timeout        – 60 second timeout per call
#   • Friendly errors– never expose raw API errors to callers
# ─────────────────────────────────────────────────────────────

import asyncio
import re
import time
import logging

logger = logging.getLogger(__name__)

# ── Queue state ───────────────────────────────────────────────
_queue_lock = asyncio.Lock()
_last_call_time: float = 0.0

# Part 4: separate gaps for chat (fast) vs summarize (safe)
_MIN_GAP_CHAT      = 3    # seconds — chat feels instant
_MIN_GAP_SUMMARIZE = 15   # seconds — summarize can wait

_MAX_RETRIES    = 3
_DEFAULT_WAIT   = 30
_CALL_TIMEOUT   = 60   # 60s timeout per Gemini call
_MAX_QUEUE_SIZE = 10   # reject beyond 10 queued requests

# Track how many requests are currently waiting in the queue
_queue_waiters: int = 0


# ── Error classification ──────────────────────────────────────

def _friendly_error(exc: Exception) -> str:
    """
    Convert any Gemini/network exception into a user-friendly
    message string. Never expose raw API JSON or stack traces.
    """
    msg = str(exc)
    if "503" in msg or "UNAVAILABLE" in msg:
        return "Gemini is busy right now. Please try again in a moment."
    if "429" in msg or "quota" in msg.lower() or "RESOURCE_EXHAUSTED" in msg:
        return "Too many requests. Please wait 30 seconds and try again."
    if "401" in msg or "API_KEY" in msg:
        return "API key error. Please check your configuration."
    if "timeout" in msg.lower() or "timed out" in msg.lower():
        return "Response took too long. Please try again."
    return "Something went wrong. Please try again."


def _parse_retry_seconds(error_message: str) -> float:
    """
    Extract the wait time from a Gemini 429 error message.
    Example: "... Please retry in 21.986866463s ..."  →  21.986866463
    Falls back to _DEFAULT_WAIT if not found.
    """
    match = re.search(r"retry in ([\d.]+)s", str(error_message), re.IGNORECASE)
    if match:
        return float(match.group(1))
    return _DEFAULT_WAIT


def _is_retryable_error(exc: Exception) -> bool:
    """Check if exception is a 429 or 503 (should be retried)."""
    msg = str(exc)
    return (
        "429" in msg or "resource exhausted" in msg.lower() or
        "quota" in msg.lower() or "503" in msg or "UNAVAILABLE" in msg
    )


# ── Custom exception types ────────────────────────────────────

class GeminiQueueFullError(Exception):
    """Raised when the queue is at capacity."""
    pass


class GeminiFriendlyError(Exception):
    """
    Raised to signal a user-friendly error message should be
    returned directly to the frontend — no raw details exposed.
    """
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


# ── Main queue entry point ────────────────────────────────────

async def queued_gemini_call(call_fn, *args, mode: str = "summarize", **kwargs):
    """
    Execute a Gemini API call through the rate-limit-aware queue.

    Args:
        call_fn: A sync callable that performs the Gemini API call.
                 Run in a thread executor to avoid blocking the loop.
        mode:    "chat" (3s gap) or "summarize" (15s gap).
                 Defaults to "summarize" for safety.

    Returns:
        The result of call_fn(*args, **kwargs).

    Raises:
        GeminiFriendlyError: with a user-friendly message on any failure.
    """
    global _queue_waiters

    # Part 4: reject if queue is full
    if _queue_waiters >= _MAX_QUEUE_SIZE:
        raise GeminiFriendlyError(
            "TubBot is very busy right now. Please try again in a moment."
        )

    # Select the right gap based on call mode
    min_gap = _MIN_GAP_CHAT if mode == "chat" else _MIN_GAP_SUMMARIZE

    _queue_waiters += 1
    try:
        async with _queue_lock:
            global _last_call_time

            last_error: Exception | None = None

            for attempt in range(1, _MAX_RETRIES + 1):
                # Enforce minimum gap between calls
                elapsed = time.time() - _last_call_time
                if elapsed < min_gap:
                    gap_wait = min_gap - elapsed
                    logger.info(
                        f"[GeminiQueue:{mode}] Waiting {gap_wait:.1f}s "
                        f"(min gap)"
                    )
                    await asyncio.sleep(gap_wait)

                # Make the API call
                try:
                    logger.info(
                        f"[GeminiQueue:{mode}] Attempt {attempt}/{_MAX_RETRIES}"
                    )
                    loop = asyncio.get_event_loop()

                    # 60s timeout around every Gemini call
                    result = await asyncio.wait_for(
                        loop.run_in_executor(
                            None, lambda: call_fn(*args, **kwargs)
                        ),
                        timeout=_CALL_TIMEOUT,
                    )
                    _last_call_time = time.time()
                    return result

                except asyncio.TimeoutError:
                    _last_call_time = time.time()
                    logger.warning(
                        f"[GeminiQueue:{mode}] Call timed out after 60s."
                    )
                    raise GeminiFriendlyError(
                        "Response took too long. Please try again."
                    )

                except Exception as exc:
                    _last_call_time = time.time()

                    if not _is_retryable_error(exc):
                        # Not retryable — translate and raise immediately
                        raise GeminiFriendlyError(_friendly_error(exc))

                    last_error = exc
                    wait_seconds = _parse_retry_seconds(str(exc))

                    if attempt < _MAX_RETRIES:
                        # Escalating wait: 15s, 30s
                        wait_seconds = max(wait_seconds, 15 * attempt)
                        logger.warning(
                            f"[GeminiQueue:{mode}] Retryable error (429/503). "
                            f"Waiting {wait_seconds:.1f}s before retry "
                            f"(attempt {attempt}/{_MAX_RETRIES})..."
                        )
                        remaining = wait_seconds
                        while remaining > 0:
                            logger.info(
                                f"[GeminiQueue:{mode}] Retrying in {remaining:.0f}s..."
                            )
                            sleep_step = min(5, remaining)
                            await asyncio.sleep(sleep_step)
                            remaining -= sleep_step
                    else:
                        logger.error(
                            f"[GeminiQueue:{mode}] All {_MAX_RETRIES} retries "
                            f"exhausted."
                        )

            # All retries exhausted
            raise GeminiFriendlyError(
                _friendly_error(last_error) if last_error
                else "Something went wrong. Please try again."
            )
    finally:
        _queue_waiters -= 1
