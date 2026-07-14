import { useState } from "react";

export default function StarRating({ value = 0, onRate, size = 28, disabled = false }) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHoverValue(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHoverValue(star)}
          onClick={() => onRate?.(star)}
          className="disabled:cursor-not-allowed transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={star <= displayValue ? "#E8A33D" : "none"} stroke="#E8A33D" strokeWidth="1.5">
            <path d="M12 2.5l2.9 6.06 6.6.77-4.85 4.62 1.24 6.6L12 17.4l-5.89 3.15 1.24-6.6L2.5 9.33l6.6-.77L12 2.5z" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}