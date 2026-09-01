// ─────────────────────────────────────────────────────────────
// src/components/SummaryCard.jsx
// ─────────────────────────────────────────────────────────────
// Renders a rich video brief card from JSON summary data.
// Redesigned with light/dark theme support. Structure preserved,
// styling updated for both modes.
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";

// ── Badge color maps ─────────────────────────────────────────
const CATEGORY_CLASS = "bg-accent text-white";

const DIFFICULTY_COLORS = {
  Beginner:     "dark:bg-[#064E3B] dark:text-[#34D399] bg-[#ECFDF5] text-[#059669]",
  Intermediate: "dark:bg-[#451A03] dark:text-[#FBBF24] bg-[#FFFBEB] text-[#D97706]",
  Advanced:     "dark:bg-[#4C0519] dark:text-[#FB7185] bg-[#FFF1F2] text-[#E11D48]",
};

// ── Chevron icon ─────────────────────────────────────────────
function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-4 w-4 dark:text-[#9090B8] text-[#555588] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Accordion item ───────────────────────────────────────────
function AccordionItem({ heading, points, isOpen, onToggle }) {
  return (
    <div className="border dark:border-border-dark border-border-light rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="
          w-full flex items-center justify-between px-4 py-3 text-left
          dark:hover:bg-bg-dark-3 hover:bg-bg-light-3
          transition-all duration-200
        "
      >
        <span className="dark:text-[#E8E8F0] text-[#1A1A2E] font-semibold text-sm">{heading}</span>
        <ChevronIcon open={isOpen} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <ul className="px-4 pb-3 space-y-1.5 dark:bg-bg-dark-3 bg-bg-light-3">
          {points.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm dark:text-[#9090B8] text-[#555588]">
              <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Section divider ──────────────────────────────────────────
function Divider() {
  return <hr className="dark:border-border-dark border-border-light my-0" />;
}

// ── Copy icon SVG ────────────────────────────────────────────
function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 16h8M8 12h8M8 8h4m4 0h-1a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V8z" />
    </svg>
  );
}

// ── Check icon SVG ───────────────────────────────────────────
function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-[#34D399] mt-0.5 shrink-0" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── Section heading with indigo left border ──────────────────
function SectionHeading({ children }) {
  return (
    <h3 className="dark:text-[#E8E8F0] text-[#1A1A2E] font-semibold text-base pl-3 border-l-2 border-accent">
      {children}
    </h3>
  );
}

// ── Plain text fallback ──────────────────────────────────────
function PlainTextFallback({ summary }) {
  return (
    <article
      id="summary-card"
      className="
        w-full max-w-2xl mx-auto mt-8 rounded-2xl border overflow-hidden animate-fade-in
        dark:border-border-dark border-border-light
        dark:bg-bg-dark-2 bg-white
        dark:shadow-none shadow-sm
      "
      aria-label="Video summary"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b dark:border-border-dark border-border-light">
        <h2 className="dark:text-[#E8E8F0] text-[#1A1A2E] font-semibold text-base">AI Summary</h2>
      </div>
      <div className="px-6 py-5 dark:text-[#9090B8] text-[#555588] leading-relaxed text-sm whitespace-pre-wrap">
        {summary}
      </div>
      {/* Copy at bottom */}
      <div className="flex justify-end px-6 py-3 border-t dark:border-border-dark border-border-light">
        <button
          id="copy-summary-btn"
          onClick={() => navigator.clipboard.writeText(summary)}
          title="Copy summary to clipboard"
          className="
            text-xs dark:text-[#9090B8] text-[#555588]
            dark:hover:text-[#E8E8F0] hover:text-[#1A1A2E]
            transition-all duration-200
            flex items-center gap-1 px-2 py-1 rounded-lg
            dark:hover:bg-bg-dark-3 hover:bg-bg-light-3
          "
        >
          <CopyIcon />
        </button>
      </div>
    </article>
  );
}

// ── Main SummaryCard component ───────────────────────────────
/**
 * @param {Object} props
 * @param {string} props.summary - The raw summary text (JSON) from the API
 */
export default function SummaryCard({ summary }) {
  // ── All hooks MUST be called before any early returns ─────
  const [openIndex, setOpenIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const data = useMemo(() => {
    if (!summary) return null;
    try {
      // Strip markdown code fences if Gemini wraps the response
      let cleaned = summary.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
      }
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }, [summary]);

  // ── Early returns after all hooks ─────────────────────────
  if (!summary) return null;
  if (!data) return <PlainTextFallback summary={summary} />;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyClass = DIFFICULTY_COLORS[data.difficulty] || DIFFICULTY_COLORS.Beginner;

  return (
    <article
      id="summary-card"
      className="
        w-full max-w-2xl mx-auto mt-8 rounded-2xl border overflow-hidden animate-fade-in
        dark:border-border-dark border-border-light
        dark:bg-bg-dark-2 bg-white
        dark:shadow-none shadow-sm
      "
      aria-label="Video summary"
    >
      {/* ═══════════════════════════════════════════════════════
          Section 1 — Hero Card
      ═══════════════════════════════════════════════════════ */}
      <div className="px-6 pt-5 pb-5">
        {/* Badges row */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {/* Category badge */}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_CLASS}`}>
            {data.category || "Video"}
          </span>

          {/* Spacer pushes right-side badges */}
          <div className="ml-auto flex items-center gap-2">
            {/* Difficulty badge */}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyClass}`}>
              {data.difficulty || "General"}
            </span>

            {/* Watch time badge */}
            <span className="
              text-xs font-medium px-2.5 py-1 rounded-full
              dark:bg-bg-dark-3 bg-bg-light-3
              dark:text-[#9090B8] text-[#555588]
              flex items-center gap-1
            ">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {data.estimated_watch_time || "N/A"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold dark:text-[#E8E8F0] text-[#1A1A2E] leading-tight mb-2">
          {data.title || "Video Summary"}
        </h2>

        {/* TL;DR */}
        <p className="dark:text-[#9090B8] text-[#555588] italic text-sm">
          {data.tldr || ""}
        </p>
      </div>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          Section 2 — Core Content
      ═══════════════════════════════════════════════════════ */}
      <div className="px-6 py-5 space-y-4">
        <SectionHeading>Core Content</SectionHeading>

        {/* What video teaches — blockquote style */}
        {data.core_content?.what_video_teaches && (
          <blockquote className="
            border-l-[3px] border-accent pl-4 py-2.5
            dark:text-[#E8E8F0] text-[#1A1A2E]
            italic text-sm
            dark:bg-bg-dark-3 bg-bg-light-3
            rounded-r-lg
          ">
            {data.core_content.what_video_teaches}
          </blockquote>
        )}

        {/* Key Concepts */}
        {data.core_content?.key_concepts?.length > 0 && (
          <div>
            <h4 className="dark:text-[#9090B8] text-[#555588] font-medium text-sm mb-3">Key Concepts Explained</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.core_content.key_concepts.map((kc, i) => (
                <div
                  key={i}
                  className="
                    border dark:border-border-dark border-border-light
                    rounded-xl px-4 py-3
                    dark:bg-bg-dark-3 bg-bg-light-3
                    dark:hover:bg-[#2E2E55] hover:bg-[#E8E8F8]
                    transition-all duration-200
                  "
                >
                  <p className="dark:text-[#E8E8F0] text-[#1A1A2E] font-semibold text-sm">{kc.concept}</p>
                  <p className="dark:text-[#9090B8] text-[#555588] text-xs mt-1">{kc.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Biggest takeaway */}
        {data.core_content?.biggest_takeaway && (
          <div className="
            border-l-[3px] border-[#FBBF24]
            dark:bg-bg-dark-3 bg-bg-light-3
            rounded-r-lg px-4 py-3
          ">
            <p className="text-xs text-[#FBBF24] font-medium mb-1 uppercase tracking-wider">Biggest Takeaway</p>
            <p className="dark:text-[#E8E8F0] text-[#1A1A2E] font-semibold text-sm">{data.core_content.biggest_takeaway}</p>
          </div>
        )}
      </div>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          Section 3 — What This Video Covers (Accordions)
      ═══════════════════════════════════════════════════════ */}
      {data.main_topics?.length > 0 && (
        <div className="px-6 py-5 space-y-3">
          <SectionHeading>What This Video Covers</SectionHeading>
          <div className="space-y-2">
            {data.main_topics.map((topic, i) => (
              <AccordionItem
                key={i}
                heading={topic.heading}
                points={topic.points || []}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      )}

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          Section 4 — What You'll Learn
      ═══════════════════════════════════════════════════════ */}
      {data.what_you_will_learn?.length > 0 && (
        <div className="px-6 py-5 space-y-3">
          <SectionHeading>What You'll Learn</SectionHeading>
          <ul className="space-y-2">
            {data.what_you_will_learn.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm dark:text-[#E8E8F0] text-[#1A1A2E]">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          Section 5 — Prerequisites
      ═══════════════════════════════════════════════════════ */}
      <div className="px-6 py-5 space-y-3">
        <SectionHeading>Prerequisites</SectionHeading>
        <div className="dark:bg-bg-dark-3 bg-bg-light-3 rounded-xl px-4 py-3">
          {data.prerequisites?.length > 0 ? (
            <ul className="space-y-1.5">
              {data.prerequisites.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm dark:text-[#9090B8] text-[#555588]">
                  <span className="dark:text-[#9090B8] text-[#555588] mt-0.5 shrink-0">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm dark:text-[#9090B8] text-[#555588] italic">No prerequisites - anyone can watch</p>
          )}
        </div>
      </div>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          Section 6 — Good For / Not For
      ═══════════════════════════════════════════════════════ */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Good For */}
          <div className="border dark:border-border-dark border-border-light rounded-xl px-4 py-3.5 dark:bg-bg-dark bg-bg-light">
            <h4 className="text-sm font-semibold dark:text-[#E8E8F0] text-[#1A1A2E] mb-2">Good For</h4>
            {data.good_for?.length > 0 ? (
              <ul className="space-y-1.5">
                {data.good_for.map((item, i) => (
                  <li key={i} className="text-sm text-[#34D399] flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm dark:text-[#9090B8] text-[#555588] italic">Everyone</p>
            )}
          </div>

          {/* Not For */}
          <div className="border dark:border-border-dark border-border-light rounded-xl px-4 py-3.5 dark:bg-bg-dark bg-bg-light">
            <h4 className="text-sm font-semibold dark:text-[#E8E8F0] text-[#1A1A2E] mb-2">Not For</h4>
            {data.not_for?.length > 0 ? (
              <ul className="space-y-1.5">
                {data.not_for.map((item, i) => (
                  <li key={i} className="text-sm text-[#FB7185] flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm dark:text-[#9090B8] text-[#555588] italic">Nobody - it's for everyone!</p>
            )}
          </div>
        </div>
      </div>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          Copy button — bottom right only
      ═══════════════════════════════════════════════════════ */}
      <div className="flex justify-end px-6 py-3">
        <button
          id="copy-summary-btn"
          onClick={handleCopy}
          title="Copy summary to clipboard"
          className="
            text-xs
            dark:text-[#9090B8] text-[#555588]
            dark:hover:text-[#E8E8F0] hover:text-[#1A1A2E]
            transition-all duration-200
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            dark:hover:bg-bg-dark-3 hover:bg-bg-light-3
          "
        >
          <CopyIcon />
          {copied ? "Copied!" : ""}
        </button>
      </div>
    </article>
  );
}
