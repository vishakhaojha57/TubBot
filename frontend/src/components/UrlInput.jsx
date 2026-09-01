// ─────────────────────────────────────────────────────────────
// src/components/UrlInput.jsx
// ─────────────────────────────────────────────────────────────
// Controlled input component for the YouTube URL.
// Validates that the user typed something before calling back.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";

/**
 * @param {Object}   props
 * @param {Function} props.onSubmit   - Called with the trimmed URL string
 * @param {boolean}  props.isLoading  - Disables the form while fetching
 */
export default function UrlInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // Basic client-side validation
    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError("Please enter a YouTube URL.");
      return;
    }
    if (!trimmed.includes("youtube.com") && !trimmed.includes("youtu.be")) {
      setValidationError("That doesn't look like a YouTube URL.");
      return;
    }

    setValidationError("");
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
      aria-label="YouTube URL submission form"
    >
      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="youtube-url-input"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (validationError) setValidationError(""); // clear on edit
          }}
          placeholder="Paste a YouTube URL..."
          disabled={isLoading}
          className={`
            flex-1 rounded-xl px-5 py-3.5
            bg-[#16162A] text-[#F1F0ED] placeholder-[#5C5A7A]
            border transition-all duration-200 outline-none
            focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/30
            disabled:opacity-50 disabled:cursor-not-allowed
            text-sm
            ${validationError ? "border-[#FB7185]" : "border-[#2A2A45] hover:border-[#3A3A55]"}
          `}
          aria-describedby={validationError ? "url-error" : undefined}
          aria-invalid={!!validationError}
        />

        <button
          id="summarize-btn"
          type="submit"
          disabled={isLoading}
          className="
            rounded-xl px-7 py-3.5 font-semibold text-white
            bg-[#6366F1] hover:bg-[#4F46E5]
            active:scale-95
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
            whitespace-nowrap text-sm
          "
        >
          {isLoading ? "Summarising..." : "Summarise"}
        </button>
      </div>

      {/* Validation error */}
      {validationError && (
        <p
          id="url-error"
          role="alert"
          className="mt-2 text-sm text-[#FB7185] pl-1"
        >
          {validationError}
        </p>
      )}
    </form>
  );
}
