// ─────────────────────────────────────────────────────────────
// src/components/ScrollToTop.jsx
// ─────────────────────────────────────────────────────────────
// Floating scroll-to-top button — bottom-right corner.
// Appears after 300px scroll. Indigo background both modes.
// Rounded-full per spec.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 300);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      id="scroll-to-top-btn"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed bottom-6 right-6 z-50
        h-11 w-11 rounded-full
        bg-accent hover:bg-[#4F46E5]
        text-white
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:scale-105
        shadow-lg shadow-accent/20
        ${isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-4 opacity-0 pointer-events-none"
        }
      `}
    >
      {/* Up-arrow icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 15l7-7 7 7"
        />
      </svg>
    </button>
  );
}
