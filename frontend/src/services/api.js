// ─────────────────────────────────────────────────────────────
// src/services/api.js
// ─────────────────────────────────────────────────────────────
// Centralised API layer — all backend calls live here so that
// if the base URL ever changes, we only update one place.
// ─────────────────────────────────────────────────────────────

import axios from "axios";

// Base URL of the FastAPI backend.
// Reads from VITE_API_BASE_URL env var (.env / .env.production).
// Falls back to localhost:8000 for local development.
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/v1`;

/**
 * Send a YouTube URL to the backend and get a structured summary.
 *
 * @param {string} youtubeUrl  - Any valid YouTube video URL.
 * @returns {Promise<string>}  - The summary text returned by Gemini.
 * @throws {Error}             - Throws with a user-friendly message on failure.
 */
export async function summarizeVideo(youtubeUrl) {
  try {
    const response = await axios.post(`${API_BASE_URL}/summarize`, {
      url: youtubeUrl,
    });

    // The backend returns { "summary": "..." }
    return response.data.summary;
  } catch (error) {
    // Pull the detail message from FastAPI's error response if available
    const detail =
      error?.response?.data?.detail ||
      "Something went wrong. Please try again.";
    throw new Error(detail);
  }
}
