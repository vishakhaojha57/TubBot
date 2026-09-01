// ─────────────────────────────────────────────────────────────
// src/components/Navbar.jsx
// ─────────────────────────────────────────────────────────────
// Redesigned navbar — transparent with backdrop blur.
// Left: TubBot logo (indigo play icon in rounded square) + name.
// Right: Theme toggle only (sun/moon icons).
// No GitHub link, external links, badges, or pills.
// ─────────────────────────────────────────────────────────────

/**
 * @param {Object}   props
 * @param {string}   props.theme         - "dark" | "light"
 * @param {Function} props.onToggleTheme - Callback to toggle theme
 */
export default function Navbar({ theme, onToggleTheme }) {
  const isDark = theme === "dark";

  return (
    <nav
      id="navbar"
      className={`
        sticky top-0 z-40 w-full
        backdrop-blur-md
        border-b
        px-4 sm:px-6
        ${isDark
          ? "bg-bg-dark/80 border-border-dark"
          : "bg-bg-light/80 border-border-light"
        }
      `}
    >
      <div className="max-w-5xl mx-auto h-14 flex items-center justify-between">
        {/* ── Brand / Logo ──────────────────────────────────── */}
        <a
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="TubBot - Home"
        >
          {/* Play-button icon in indigo rounded square */}
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* App name */}
          <span className={`text-base font-bold tracking-tight ${isDark ? "text-[#E8E8F0]" : "text-[#1A1A2E]"}`}>
            TubBot
          </span>
        </a>

        {/* ── Right side — Theme toggle only ────────────────── */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={`
            h-9 w-9 rounded-full
            flex items-center justify-center
            transition-all duration-300
            hover:scale-105
            ${isDark
              ? "bg-bg-dark-3 hover:bg-[#2E2E5E] text-[#9090B8]"
              : "bg-bg-light-3 hover:bg-border-light text-[#555588]"
            }
          `}
        >
          {/* Sun icon — shown when in dark mode (click to go light) */}
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-[18px] w-[18px] transition-transform duration-300 rotate-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            /* Moon icon — shown when in light mode (click to go dark) */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-[18px] w-[18px] transition-transform duration-300 rotate-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
