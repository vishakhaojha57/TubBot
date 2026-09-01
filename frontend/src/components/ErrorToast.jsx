// ─────────────────────────────────────────────────────────────
// src/components/ErrorToast.jsx
// ─────────────────────────────────────────────────────────────
// Floating toast notification — top-right corner.
// Auto-dismisses after 4s. Supports "error" (rose border) and
// "success" (emerald border) variants.
// Theme-aware: dark bg in dark mode, white bg in light mode.
// Rounded-xl per spec.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

export default function ErrorToast({ message, type = "error", onClose }) {
  // ── Local state for slide-out animation before unmounting ──
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in on mount (small delay so transition fires)
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      // Wait for the slide-out animation to finish before calling onClose
      setTimeout(onClose, 300);
    }, 4000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose]);

  // ── Variant styles ─────────────────────────────────────────
  const isError = type === "error";

  const borderColor = isError ? "border-[#FB7185]" : "border-[#34D399]";
  const textColor = isError ? "text-[#FB7185]" : "text-[#34D399]";

  return (
    <div
      id="error-toast"
      role="alert"
      aria-live="assertive"
      className={`
        fixed top-5 right-5 z-50
        max-w-sm w-full
        flex items-start gap-3
        px-4 py-3.5 rounded-xl
        border
        ${borderColor}
        dark:bg-bg-dark-2 bg-white
        ${textColor}
        text-sm
        shadow-lg
        transition-all duration-300 ease-in-out
        ${isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
        }
      `}
    >
      {/* Icon */}
      <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isError ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        )}
      </svg>

      {/* Message text */}
      <p className="flex-1 leading-snug">{message}</p>

      {/* Manual close button */}
      <button
        id="toast-close-btn"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="
          shrink-0 ml-2 mt-0.5
          opacity-60 hover:opacity-100
          transition-all duration-200
        "
        aria-label="Dismiss notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
