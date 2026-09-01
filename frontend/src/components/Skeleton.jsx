// ─────────────────────────────────────────────────────────────
// src/components/Skeleton.jsx
// ─────────────────────────────────────────────────────────────
// Theme-aware skeleton loading card.
// Mimics SummaryCard shape. Uses custom skeleton-pulse class
// that changes colors based on theme (CSS vars in index.css).
// ─────────────────────────────────────────────────────────────

export default function Skeleton() {
  return (
    <div
      id="skeleton-loader"
      className="
        w-full max-w-2xl mx-auto mt-8
        rounded-2xl border
        dark:border-border-dark border-border-light
        dark:bg-bg-dark-2 bg-white
        overflow-hidden
        animate-fade-in
      "
      role="status"
      aria-label="Loading summary..."
    >
      {/* ── Skeleton hero — badges + title ────────────────────── */}
      <div className="px-6 pt-5 pb-5">
        {/* Badge placeholders */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-20 rounded-full skeleton-pulse" />
          <div className="ml-auto flex items-center gap-2">
            <div className="h-6 w-24 rounded-full skeleton-pulse" />
            <div className="h-6 w-24 rounded-full skeleton-pulse" />
          </div>
        </div>

        {/* Title placeholder */}
        <div className="h-6 w-3/4 rounded-lg skeleton-pulse mb-3" />

        {/* TL;DR placeholder */}
        <div className="h-4 w-full rounded-lg skeleton-pulse opacity-60" />
      </div>

      {/* Divider */}
      <hr className="dark:border-border-dark border-border-light" />

      {/* ── Skeleton body ──────────────────────────────────── */}
      <div className="px-6 py-5 space-y-4">
        {/* Section heading placeholder */}
        <div className="h-4 w-32 rounded-lg skeleton-pulse border-l-2 border-accent pl-3" />

        {/* Blockquote placeholder */}
        <div className="border-l-[3px] dark:border-border-dark border-border-light dark:bg-bg-dark-3/40 bg-bg-light-3 rounded-r-lg pl-4 py-3 space-y-2">
          <div className="h-3 w-full rounded-md skeleton-pulse" />
          <div className="h-3 w-4/5 rounded-md skeleton-pulse" />
        </div>

        {/* Key concepts grid placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border dark:border-border-dark border-border-light rounded-xl px-4 py-3 dark:bg-bg-dark-3/40 bg-bg-light-3/40">
              <div className="h-3.5 w-24 rounded-md skeleton-pulse mb-2" />
              <div className="h-3 w-full rounded-md skeleton-pulse opacity-60" />
            </div>
          ))}
        </div>

        {/* Takeaway placeholder */}
        <div className="border-l-[3px] dark:border-border-dark border-border-light dark:bg-bg-dark-3/40 bg-bg-light-3 rounded-r-lg px-4 py-3">
          <div className="h-3 w-28 rounded-md skeleton-pulse mb-2" />
          <div className="h-3.5 w-full rounded-md skeleton-pulse" />
        </div>
      </div>

      {/* Divider */}
      <hr className="dark:border-border-dark border-border-light" />

      {/* ── Accordion skeleton ──────────────────────────────── */}
      <div className="px-6 py-5 space-y-3">
        <div className="h-4 w-40 rounded-lg skeleton-pulse border-l-2 border-accent pl-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border dark:border-border-dark border-border-light rounded-xl px-4 py-3">
              <div className={`h-4 rounded-md skeleton-pulse ${n === 1 ? "w-48" : n === 2 ? "w-40" : "w-44"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
