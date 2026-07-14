import { posterUrl } from "../utils/tmdbImage";
import RatingBadge from "./RatingBadge";

export default function RecommendationCard({ movie, onClick }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const poster = posterUrl(movie.poster_path);

  return (
    <button
      onClick={() => onClick?.(movie)}
      className="w-full flex gap-4 text-left bg-surface border border-border rounded-card p-4 hover:border-amber/50 transition-colors"
    >
      <div className="w-20 h-28 flex-shrink-0 rounded-md overflow-hidden bg-surfaceRaised">
        {poster ? (
          <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-[10px] font-mono text-center px-1">
            No poster
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold text-cream leading-snug">{movie.title}</h3>
            <p className="text-xs font-mono text-muted mt-0.5">{year}</p>
          </div>
          <RatingBadge score={movie.vote_average} size={34} />
        </div>

        {movie.reason && (
          <p className="text-sm text-cream/80 mt-2 leading-relaxed">
            <span className="text-amber font-mono text-xs uppercase tracking-wide mr-1.5">Why this:</span>
            {movie.reason}
          </p>
        )}
      </div>
    </button>
  );
}