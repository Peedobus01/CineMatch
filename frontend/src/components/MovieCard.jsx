import { posterUrl } from "../utils/tmdbImage";
import RatingBadge from "./RatingBadge";

export default function MovieCard({ movie, genreMap = {}, onClick }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const genreNames = (movie.genre_ids || [])
    .map((id) => genreMap[id])
    .filter(Boolean)
    .slice(0, 2);
  const poster = posterUrl(movie.poster_path);

  return (
    <button
    onClick={() => onClick?.(movie)}
    className="group w-full block text-left bg-surface border border-border rounded-card overflow-hidden hover:border-amber/50 transition-colors"
    >
      <div className="aspect-[2/3] bg-surfaceRaised relative overflow-hidden">
        {poster ? (
          <img src={poster} alt={movie.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs font-mono px-3 text-center">
            No poster available
          </div>
        )}
        <div className="absolute top-2 right-2 bg-ink/80 rounded-full backdrop-blur">
          <RatingBadge score={movie.vote_average} size={36} />
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-display font-semibold text-cream text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
        {movie.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-mono text-muted">
          <span>{year}</span>
          {genreNames.length > 0 && (
            <>
              <span>·</span>
              <span className="truncate">{genreNames.join(", ")}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}