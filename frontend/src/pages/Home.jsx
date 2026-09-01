// ─────────────────────────────────────────────────────────────
// src/pages/Home.jsx
// ─────────────────────────────────────────────────────────────
// Home page with hero layout.
// Before URL submission: centered hero with logo, title,
// tagline, input, and feature pills.
// After submission: hero shrinks, shows summary card.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import SummaryCard from "../components/SummaryCard";
import Skeleton from "../components/Skeleton";
import ErrorToast from "../components/ErrorToast";
import { summarizeVideo } from "../services/api";

export default function Home() {
  // ── State ──────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary]     = useState("");
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState(null);
  const [url, setUrl]             = useState("");
  const [validationError, setValidationError] = useState("");

  // Has the user submitted a URL? Controls hero vs content view
  const hasContent = summary || isLoading;

  // ── Submit handler ─────────────────────────────────────────
  async function handleSubmit(e) {
    if (e) e.preventDefault();

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
    setIsLoading(true);
    setSummary("");
    setError("");

    try {
      const result = await summarizeVideo(trimmed);
      setSummary(result);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setToast({ message: err.message || "An unexpected error occurred.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <main className="min-h-screen dark:bg-bg-dark bg-bg-light flex flex-col">

      {/* ── Hero Section — shown when no content loaded ──────── */}
      {!hasContent && (
        <section className="flex-1 flex flex-col items-center justify-center px-4 pb-20 animate-fade-up">
          {/* Large logo */}
          <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-6 animate-pulse-soft">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* App name — gradient text */}
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-[#6366F1] to-[#A855F7] bg-clip-text text-transparent">
            TubBot
          </h1>

          {/* Tagline */}
          <p className="dark:text-[#9090B8] text-[#555588] text-sm mb-8 text-center">
            Understand any YouTube video instantly
          </p>

          {/* URL Input */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl" aria-label="YouTube URL submission form">
            <div className="relative flex items-center">
              <input
                id="youtube-url-input"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (validationError) setValidationError("");
                }}
                placeholder="Paste YouTube URL here..."
                className={`
                  w-full rounded-2xl pl-5 pr-14 py-4
                  dark:bg-bg-dark-2 bg-white
                  dark:text-[#E8E8F0] text-[#1A1A2E]
                  dark:placeholder-[#9090B8] placeholder-[#555588]
                  border outline-none
                  focus:ring-2 focus:ring-accent/30 focus:border-accent
                  transition-all duration-200
                  text-sm
                  ${validationError
                    ? "border-[#FB7185]"
                    : "dark:border-border-dark border-border-light dark:hover:border-[#3A3A6E] hover:border-[#CCCCDD]"
                  }
                `}
                aria-describedby={validationError ? "url-error" : undefined}
                aria-invalid={!!validationError}
              />
              {/* Submit arrow button */}
              <button
                id="summarize-btn"
                type="submit"
                title="Summarise video"
                className="
                  absolute right-2
                  h-10 w-10 rounded-xl
                  bg-accent hover:bg-[#4F46E5]
                  flex items-center justify-center
                  transition-all duration-200
                  hover:scale-[1.02]
                  active:scale-95
                  text-white
                "
                aria-label="Summarise video"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h14" />
                </svg>
              </button>
            </div>

            {/* Validation error */}
            {validationError && (
              <p id="url-error" role="alert" className="mt-2 text-sm text-[#FB7185] pl-1">
                {validationError}
              </p>
            )}
          </form>

          {/* Feature pills — Summarise & Learn, centered with gap */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {["Summarise", "Learn"].map((label) => (
              <span
                key={label}
                className="
                  text-xs px-4 py-1.5 rounded-full
                  dark:bg-bg-dark-3 bg-bg-light-3
                  dark:text-[#9090B8] text-[#555588]
                  select-none
                "
              >
                {label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Compact input — shown after content loaded ────────── */}
      {hasContent && (
        <section className="px-4 pt-6 pb-4 animate-fade-up" aria-labelledby="input-section-label">
          <span id="input-section-label" className="sr-only">Video URL input</span>
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto" aria-label="YouTube URL submission form">
            <div className="relative flex items-center">
              <input
                id="youtube-url-input-compact"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (validationError) setValidationError("");
                }}
                placeholder="Paste YouTube URL here..."
                className={`
                  w-full rounded-2xl pl-5 pr-14 py-3
                  dark:bg-bg-dark-2 bg-white
                  dark:text-[#E8E8F0] text-[#1A1A2E]
                  dark:placeholder-[#9090B8] placeholder-[#555588]
                  border outline-none
                  focus:ring-2 focus:ring-accent/30 focus:border-accent
                  transition-all duration-200
                  text-sm
                  ${validationError
                    ? "border-[#FB7185]"
                    : "dark:border-border-dark border-border-light dark:hover:border-[#3A3A6E] hover:border-[#CCCCDD]"
                  }
                `}
              />
              <button
                id="summarize-btn-compact"
                type="submit"
                disabled={isLoading}
                title="Summarise video"
                className="
                  absolute right-2
                  h-9 w-9 rounded-xl
                  bg-accent hover:bg-[#4F46E5]
                  flex items-center justify-center
                  transition-all duration-200
                  hover:scale-[1.02]
                  active:scale-95
                  disabled:opacity-40 disabled:cursor-not-allowed
                  text-white
                "
                aria-label="Summarise video"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h14" />
                </svg>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ── Dynamic content area ───────────────────────────── */}
      <section className="flex-1 px-4 pb-16" aria-live="polite" aria-atomic="true">

        {/* Loading skeleton */}
        {isLoading && <Skeleton />}

        {/* API / network error */}
        {error && !isLoading && (
          <div
            id="error-banner"
            role="alert"
            className="
              w-full max-w-2xl mx-auto mt-8
              rounded-xl border
              dark:border-[#FB7185]/30 border-[#FB7185]/40
              dark:bg-[#4C0519]/40 bg-[#FEF2F2]
              px-5 py-4
              flex items-start gap-3 text-sm
              dark:text-[#FB7185] text-[#E11D48]
            "
          >
            <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="font-semibold mb-0.5">Something went wrong</p>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Summary card */}
        {summary && !isLoading && <SummaryCard summary={summary} />}

      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="text-center dark:text-[#9090B8] text-[#555588] text-xs py-6 border-t dark:border-border-dark border-border-light">
        TubBot
      </footer>

      {/* ── Toast notifications ────────────────────────────── */}
      {toast && (
        <ErrorToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
