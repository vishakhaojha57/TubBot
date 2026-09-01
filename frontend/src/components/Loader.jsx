// ─────────────────────────────────────────────────────────────
// src/components/Loader.jsx
// ─────────────────────────────────────────────────────────────
// A pulsing spinner shown while the API request is in-flight.
// Uses Tailwind utility classes only — no extra CSS needed.
// ─────────────────────────────────────────────────────────────

export default function Loader() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-10"
      role="status"
      aria-label="Loading summary..."
    >
      {/* Spinning ring */}
      <div className="h-14 w-14 rounded-full border-4 border-[#2A2A45] border-t-[#6366F1] animate-spin" />

      {/* Label */}
      <p className="text-[#5C5A7A] text-sm animate-pulse">
        Analysing video transcript...
      </p>
    </div>
  );
}
