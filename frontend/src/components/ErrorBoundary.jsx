// ─────────────────────────────────────────────────────────────
// src/components/ErrorBoundary.jsx
// ─────────────────────────────────────────────────────────────
// React Error Boundary (class component).
// Wraps the entire app tree. Catches unhandled JS errors and
// shows a clean themed fallback UI. Works in both light/dark.
// ─────────────────────────────────────────────────────────────

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  // ── React lifecycle: capture the error ─────────────────────
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "An unexpected error occurred.",
    };
  }

  // ── Optional: log error info for debugging ─────────────────
  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  // ── Reset state and reload the app ─────────────────────────
  handleReload = () => {
    this.setState({ hasError: false, errorMessage: "" });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen dark:bg-bg-dark bg-bg-light flex items-center justify-center p-6">
          <div
            id="error-boundary-fallback"
            className="
              w-full max-w-md
              rounded-2xl border
              dark:border-border-dark border-border-light
              dark:bg-bg-dark-2 bg-white
              shadow-2xl dark:shadow-black/40 shadow-black/10
              text-center p-8
            "
          >
            {/* Title */}
            <h1 className="text-xl font-bold dark:text-[#E8E8F0] text-[#1A1A2E] mb-2">
              Something went wrong
            </h1>

            {/* Error detail */}
            <p className="text-sm dark:text-[#9090B8] text-[#555588] mb-6 leading-relaxed">
              {this.state.errorMessage}
            </p>

            {/* Error code card */}
            <div className="rounded-lg dark:bg-bg-dark/60 bg-bg-light-3 border dark:border-border-dark border-border-light px-4 py-3 mb-6">
              <p className="text-xs dark:text-[#9090B8] text-[#555588] font-mono break-all">
                {this.state.errorMessage}
              </p>
            </div>

            {/* Reload button */}
            <button
              id="error-boundary-reload-btn"
              onClick={this.handleReload}
              className="
                inline-flex items-center gap-2
                px-6 py-2.5 rounded-xl
                bg-accent hover:bg-[#4F46E5]
                text-white font-semibold text-sm
                transition-all duration-200
                hover:scale-[1.02]
                shadow-lg shadow-accent/20
              "
            >
              {/* Refresh icon */}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reload App
            </button>
          </div>
        </div>
      );
    }

    // ── No error — render children normally ──────────────────
    return this.props.children;
  }
}
