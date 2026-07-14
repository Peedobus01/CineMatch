import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import movieService from "../services/movieService";
import MovieCard from "../components/MovieCard";

function toCardShape(details) {
  return {
    id: details.id,
    title: details.title,
    poster_path: details.poster_path,
    vote_average: details.vote_average,
    release_date: details.release_date,
    genre_ids: (details.genres || []).map((g) => g.id),
  };
}

export default function Watchlist() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [entries, genres] = await Promise.all([
          movieService.getWatchlist(),
          movieService.getGenres(),
        ]);

        if (cancelled) return;
        setGenreMap(Object.fromEntries(genres.map((g) => [g.id, g.name])));

        const details = await Promise.all(
          entries.map((entry) => movieService.getMovieDetails(entry.tmdbId).catch(() => null))
        );
        if (cancelled) return;
        setMovies(details.filter(Boolean).map(toCardShape));
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Couldn't load your watchlist");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-cream mb-1">Watchlist</h1>
      <p className="text-muted text-sm mb-8">Movies you've saved to watch later.</p>

      {loading && <p className="text-muted font-mono text-sm">Loading...</p>}
      {error && <p className="text-amber-soft text-sm">{error}</p>}

      {!loading && !error && movies.length === 0 && (
        <p className="text-muted text-sm">
          Nothing here yet — add movies from their details page while browsing Discover.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} genreMap={genreMap} onClick={(m) => navigate(`/movie/${m.id}`)} />
        ))}
      </div>
    </div>
  );
}