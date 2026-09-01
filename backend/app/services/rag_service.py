# ─────────────────────────────────────────────────────────────
# app/services/rag_service.py
# ─────────────────────────────────────────────────────────────
# RAG pipeline for transcript summarization:
#   1. Split plain-text transcript into overlapping chunks
#      using LangChain's RecursiveCharacterTextSplitter
#   2. Embed each chunk with Google's text-embedding-004 model
#      via langchain-google-genai
#   3. Store all embeddings in an in-memory FAISS index
#   4. Embed a summary query and run similarity search to
#      retrieve the most content-rich chunks
#   5. Return the top-k chunk texts ready for the LLM prompt
#
# Design notes:
#   • The FAISS index is rebuilt per request (stateless).
#     Videos are not cached because the summarize endpoint
#     is a one-shot call and memory stays clean.
#   • Embedding model: text-embedding-004 (768-dim, Google).
#   • Chunk size / overlap are tuned for transcript prose.
# ─────────────────────────────────────────────────────────────

from __future__ import annotations

import os
import logging

import numpy as np
import faiss
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()
logger = logging.getLogger(__name__)

# ── Embedding model ───────────────────────────────────────────
_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Lazily initialised so import doesn't fail if key missing at
# module load time (key is validated in llm_service already).
_embedder: GoogleGenerativeAIEmbeddings | None = None


def _get_embedder() -> GoogleGenerativeAIEmbeddings:
    global _embedder
    if _embedder is None:
        _embedder = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=_GEMINI_API_KEY,
        )
    return _embedder


# ── Text splitter config ──────────────────────────────────────
# chunk_size  : ~600 chars ≈ 120 tokens — small enough for
#               precise retrieval, large enough for context.
# chunk_overlap: 120 chars — preserves sentence continuity
#               across chunk boundaries.
_SPLITTER = RecursiveCharacterTextSplitter(
    chunk_size=600,
    chunk_overlap=120,
    separators=["\n\n", "\n", ". ", " ", ""],
    length_function=len,
)

# ── Summary query ─────────────────────────────────────────────
# This is embedded and used to retrieve the most informative
# chunks from the transcript via similarity search.
_SUMMARY_QUERY = (
    "What are the main topics, key ideas, important concepts, "
    "and biggest takeaways of this video?"
)


def build_rag_context(
    transcript: str,
    top_k: int = 8,
) -> str:
    """
    Run the full RAG pipeline on a plain-text transcript.

    Steps:
        1. Split transcript → chunks
        2. Embed all chunks with text-embedding-004
        3. Build an in-memory FAISS L2 index
        4. Embed the summary query
        5. Retrieve top_k most-similar chunks
        6. Return them joined as a single context string

    Args:
        transcript: Full plain-text transcript.
        top_k:      Number of chunks to retrieve (default 8,
                    giving ~4 800 chars of context).

    Returns:
        A string with the top-k most relevant transcript
        sections, separated by newlines, ready for the LLM.

    Raises:
        RuntimeError: if embedding or indexing fails.
    """
    # ── Step 1: Split ─────────────────────────────────────────
    chunks: list[str] = _SPLITTER.split_text(transcript)

    if not chunks:
        # Degenerate case — very short transcript
        return transcript[:4_000]

    logger.info(f"[RAG] Transcript split into {len(chunks)} chunks.")

    # Clamp top_k so we never ask for more than we have
    top_k = min(top_k, len(chunks))

    # ── Step 2: Embed chunks ──────────────────────────────────
    embedder = _get_embedder()
    try:
        chunk_vectors: list[list[float]] = embedder.embed_documents(chunks)
    except Exception as e:
        raise RuntimeError(
            f"Failed to embed transcript chunks: {e}"
        ) from e

    # ── Step 3: Build FAISS index ─────────────────────────────
    matrix = np.array(chunk_vectors, dtype=np.float32)
    dimension = matrix.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(matrix)

    logger.info(
        f"[RAG] FAISS index built: {index.ntotal} vectors, dim={dimension}."
    )

    # ── Step 4: Embed the summary query ──────────────────────
    try:
        query_vector: list[float] = embedder.embed_query(_SUMMARY_QUERY)
    except Exception as e:
        raise RuntimeError(
            f"Failed to embed summary query: {e}"
        ) from e

    query_np = np.array([query_vector], dtype=np.float32)

    # ── Step 5: Similarity search ─────────────────────────────
    _distances, indices = index.search(query_np, top_k)

    # Restore original document order for coherent reading
    sorted_indices = sorted(int(i) for i in indices[0] if i >= 0)
    retrieved_chunks = [chunks[i] for i in sorted_indices]

    logger.info(
        f"[RAG] Retrieved {len(retrieved_chunks)} chunks "
        f"(indices: {sorted_indices})."
    )

    # ── Step 6: Join and return ───────────────────────────────
    return "\n\n".join(retrieved_chunks)
