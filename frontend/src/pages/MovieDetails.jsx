import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import movieService from "../services/movieService";
import { posterUrl, profileUrl } from "../utils/tmdbImage";
import RatingBadge from "../components/RatingBadge";
import StarRating from "../components/StarRating";

export default function MovieDetails() {
  const { tmdbId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myRating, setMyRating] = useState(0);
  const [review, setReview] = useState("");
  const [savingRating, setSavingRating] = useState(false);
  const [ratingSaved, setRatingSaved] = useState(false);

  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistBusy, setWatchlistBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [details, myExistingRating, watchlistStatus] = await Promise.all([
          movieService.getMovieDetails(tmdbId),
          movieService.getMyRatingForMovie(tmdbId).catch(() => null),
          movieService.checkWatchlist(tmdbId).catch(() => false),
        ]);
        if (cancelled) return;
        setMovie(details);
        if (myExistingRating) {
          setMyRating(myExistingRating.rating);
          setReview(myExistingRating.review || "");
        }
        setInWatchlist(watchlistStatus);

        movieService.trackRecentlyViewed(tmdbId).catch(() => {});
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Couldn't load this movie");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  const handleRate = async (stars) => {
    setMyRating(stars);
    setSavingRating(true);
    setRatingSaved(false);
    try {
      await movieService.rateMovie(tmdbId, stars, review);
      setRatingSaved(true);
      const updated = await movieService.getMovieDetails(tmdbId);
      setMovie(updated);
    } catch {
      // leave the optimistic star value in place - non-critical failure
    } finally {
      setSavingRating(false);
    }
  };

  const handleWatchlistToggle = async () => {
    setWatchlistBusy(true);
    try {
      if (inWatchlist) {
        await movieService.removeFromWatchlist(tmdbId);
        setInWatchlist(false);
      } else {
        await movieService.addToWatchlist(tmdbId);
        setInWatchlist(true);
      }
    } finally {
      setWatchlistBusy(false);
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-muted font-mono text-sm">Loading...</div>;
  }

  if (error || !movie) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-amber-soft mb-4">{error || "Movie not found"}</p>
        <button onClick={() => navigate(-1)} className="text-muted hover:text-cream text-sm">← Go back</button>
      </div>
    );
  }

  const director = movie.credits?.crew?.find((c) => c.job === "Director");
  const topCast = (movie.credits?.cast || []).slice(0, 8);
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const runtime = movie.runtime ? `${movie.runtime} min` : "—";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={() => navigate(-1)} className="text-muted hover:text-cream text-sm mb-6">← Back</button>

      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        <div>
          <div className="aspect-[2/3] bg-surface border border-border rounded-card overflow-hidden">
            {posterUrl(movie.poster_path, "w500") ? (
              <img src={posterUrl(movie.poster_path, "w500")} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm font-mono">No poster</div>
            )}
          </div>

          <button
            onClick={handleWatchlistToggle}
            disabled={watchlistBusy}
            className={`w-full mt-4 rounded-card px-4 py-2.5 text-sm font-semibold transition-colors ${
              inWatchlist ? "bg-surfaceRaised border border-amber text-amber" : "bg-amber text-ink hover:bg-amber-soft"
            }`}
          >
            {inWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist"}
          </button>
        </div>

        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-amber uppercase mb-2">{year}</p>
          <h1 className="font-display text-3xl font-semibold text-cream mb-3">{movie.title}</h1>

          <div className="flex items-center gap-6 mb-5">
            <RatingBadge score={movie.vote_average} label="TMDB" size={48} />
            <RatingBadge score={movie.communityRating || undefined} label={`Community (${movie.communityRatingCount || 0})`} size={48} />
            <span className="font-mono text-sm text-muted">{runtime}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {(movie.genres || []).map((g) => (
              <span key={g.id} className="text-xs px-3 py-1 rounded-full border border-border text-muted">{g.name}</span>
            ))}
          </div>

          <p className="text-cream/90 leading-relaxed mb-6">{movie.overview}</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8 text-sm">
            {director && (
              <div>
                <span className="text-muted">Director</span>
                <p className="text-cream">{director.name}</p>
              </div>
            )}
            {movie.production_countries?.length > 0 && (
              <div>
                <span className="text-muted">Country</span>
                <p className="text-cream">{movie.production_countries.map((c) => c.name).join(", ")}</p>
              </div>
            )}
            {movie.spoken_languages?.length > 0 && (
              <div>
                <span className="text-muted">Language</span>
                <p className="text-cream">{movie.spoken_languages.map((l) => l.english_name).join(", ")}</p>
              </div>
            )}
            {movie.revenue > 0 && (
              <div>
                <span className="text-muted">Box office</span>
                <p className="text-cream font-mono">${movie.revenue.toLocaleString()}</p>
              </div>
            )}
          </div>

          {topCast.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm text-muted mb-3">Cast</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {topCast.map((actor) => (
                  <div key={actor.id} className="flex-shrink-0 w-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-surface border border-border overflow-hidden mx-auto mb-1.5">
                      {profileUrl(actor.profile_path) && (
                        <img src={profileUrl(actor.profile_path)} alt={actor.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <p className="text-xs text-cream truncate">{actor.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface border border-border rounded-card p-5">
            <h3 className="text-sm text-muted mb-3">Your rating</h3>
            <StarRating value={myRating} onRate={handleRate} />
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              onBlur={() => myRating > 0 && handleRate(myRating)}
              placeholder="Write a short review (optional)..."
              rows={2}
              className="input-field mt-4 resize-none"
            />
            {savingRating && <p className="text-xs text-muted font-mono mt-2">Saving...</p>}
            {ratingSaved && !savingRating && <p className="text-xs text-amber font-mono mt-2">Saved ✓</p>}
          </div>
        </div>
      </div>
    </div>
  );
}