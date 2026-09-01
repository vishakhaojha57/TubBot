// ─────────────────────────────────────────────────────────────
// src/components/CopyButton.jsx
// ─────────────────────────────────────────────────────────────
// Phase 4 — Reusable copy-to-clipboard button.
// Shows "Copy" with a clipboard icon by default. After clicking
// it writes `text` to the clipboard and switches to a green
// "Copied!" state with a checkmark for 2 seconds.
//
// Props:
//   text — the string to copy to the clipboard
// ─────────────────────────────────────────────────────────────

import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback — clipboard API might be blocked in some contexts
      console.warn("[CopyButton] Clipboard write failed.");
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={`
        inline-flex items-center gap-1.5
        text-xs font-medium
        px-2.5 py-1 rounded-lg
        transition-all duration-200
        ${copied
          ? "text-emerald-400 bg-emerald-400/10 border border-emerald-500/30"
          : "text-slate-400 hover:text-violet-400 bg-slate-700/40 hover:bg-slate-700/60 border border-slate-600/40"
        }
      `}
    >
      {copied ? (
        <>
          {/* Checkmark icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          {/* Clipboard icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16h8M8 12h8M8 8h4m4 0h-1a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V8z"
            />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
