// Large-scale version of the countdown-leader signature motif, used as the
// editorial panel on auth pages. Built as a component (not a raster image)
// so it stays crisp at any size and costs nothing to load.
export default function AuthVisualPanel({ eyebrow, headline, sub }) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-1/2 min-h-screen bg-surface px-14 py-16 overflow-hidden">
      {/* Ambient countdown ring, oversized and cropped, sitting behind the copy */}
      <svg
        className="absolute -right-40 top-1/2 -translate-y-1/2 opacity-90"
        width="520"
        height="520"
        viewBox="0 0 520 520"
        fill="none"
      >
        <circle cx="260" cy="260" r="220" stroke="#2E2F33" strokeWidth="1" />
        <circle cx="260" cy="260" r="180" stroke="#E8A33D" strokeWidth="1.5" opacity="0.55" />
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const x1 = 260 + 180 * Math.sin(angle);
          const y1 = 260 - 180 * Math.cos(angle);
          const x2 = 260 + 196 * Math.sin(angle);
          const y2 = 260 - 196 * Math.cos(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#E8A33D"
              strokeWidth={i % 6 === 0 ? 2 : 1}
              opacity={i % 6 === 0 ? 0.9 : 0.4}
            />
          );
        })}
      </svg>

      <div className="relative z-10">
        <span className="font-mono text-xs tracking-[0.2em] text-amber uppercase">
          {eyebrow}
        </span>
      </div>

      <div className="relative z-10 max-w-md">
        <h1 className="font-display text-5xl leading-[1.1] font-semibold text-cream">
          {headline}
        </h1>
        <p className="mt-5 text-muted text-base leading-relaxed">{sub}</p>
      </div>

      <div className="relative z-10 font-mono text-xs text-muted">
        No trailers. No streaming. Just the right next movie.
      </div>
    </div>
  );
}
