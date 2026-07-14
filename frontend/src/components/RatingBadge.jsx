export default function RatingBadge({ score, size = 40, label }) {
  const display = typeof score === "number" ? score.toFixed(1) : "—";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="17" stroke="#2E2F33" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="17" stroke="#E8A33D" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
        <text x="20" y="25" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="12.5" fontWeight="500" fill="#EDEAE3">
          {display}
        </text>
      </svg>
      {label && <span className="text-[10px] font-mono text-muted uppercase tracking-wide">{label}</span>}
    </div>
  );
}