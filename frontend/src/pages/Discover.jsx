import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import movieService from "../services/movieService";
import MovieCard from "../components/MovieCard";
import PersonAutocomplete from "../components/PersonAutocomplete";

const MAX_GENRES = 2;
const LANGUAGES = [
  { code: "", label: "Any language" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
];

export default function Discover() {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState([]);
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState([]);
  const [actors, setActors] = useState([]);
  const [minRating, setMinRating] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [runtimeMin, setRuntimeMin] = useState("");
  const [runtimeMax, setRuntimeMax] = useState("");
  const [language, setLanguage] = useState("");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    movieService.getGenres().then(setGenres).catch(() => setGenres([]));
  }, []);

  const genreMap = Object.fromEntries(genres.map((g) => [g.id, g.name]));

  const toggleGenre = (id) => {
    setSelectedGenreIds((prev) => {
      if (prev.includes(id)) return prev.filter((g) => g !== id);
      if (prev.length >= MAX_GENRES) return prev;
      return [...prev, id];
    });
  };

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const filters = {
        title: title.trim() || undefined,
        genreIds: selectedGenreIds.length ? selectedGenreIds : undefined,
        directorId: director[0]?.id,
        actorIds: actors.length ? actors.map((a) => a.id) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        yearFrom: yearFrom ? Number(yearFrom) : undefined,
        yearTo: yearTo ? Number(yearTo) : undefined,
        runtimeMin: runtimeMin ? Number(runtimeMin) : undefined,
        runtimeMax: runtimeMax ? Number(runtimeMax) : undefined,
        language: language || undefined,
      };
      const data = await movieService.discoverMovies(filters, 1);
      setResults(data.results);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong while searching");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [title, selectedGenreIds, director, actors, minRating, yearFrom, yearTo, runtimeMin, runtimeMax, language]);

  const handleReset = () => {
    setTitle("");
    setSelectedGenreIds([]);
    setDirector([]);
    setActors([]);
    setMinRating("");
    setYearFrom("");
    setYearTo("");
    setRuntimeMin("");
    setRuntimeMax("");
    setLanguage("");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-cream mb-1">Discover</h1>
      <p className="text-muted text-sm mb-8">
        Leave anything blank, or combine filters — up to {MAX_GENRES} genres at a time.
      </p>

      <div className="bg-surface border border-border rounded-card p-5 mb-10 space-y-5">
        <div>
          <label className="block text-sm text-muted mb-1.5">Movie title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Search by title..." className="input-field" />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1.5">
            Genres <span className="font-mono text-xs">({selectedGenreIds.length}/{MAX_GENRES})</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const isSelected = selectedGenreIds.includes(g.id);
              const isDisabled = !isSelected && selectedGenreIds.length >= MAX_GENRES;
              return (
                <button
                  key={g.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleGenre(g.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    isSelected
                      ? "bg-amber text-ink border-amber font-semibold"
                      : isDisabled
                      ? "border-border text-muted/50 cursor-not-allowed"
                      : "border-border text-muted hover:text-cream hover:border-cream/40"
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-muted mb-1.5">Director</label>
            <PersonAutocomplete selected={director} onChange={(next) => setDirector(next.slice(-1))} placeholder="Search for a director..." maxSelected={1} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Actors</label>
            <PersonAutocomplete selected={actors} onChange={setActors} placeholder="Search for actors..." maxSelected={3} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-sm text-muted mb-1.5">Min. rating</label>
            <input type="number" min="0" max="10" step="0.5" value={minRating} onChange={(e) => setMinRating(e.target.value)} placeholder="e.g. 7" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Year from</label>
            <input type="number" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} placeholder="e.g. 2010" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Year to</label>
            <input type="number" value={yearTo} onChange={(e) => setYearTo(e.target.value)} placeholder="e.g. 2024" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field">
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Runtime min (mins)</label>
            <input type="number" value={runtimeMin} onChange={(e) => setRuntimeMin(e.target.value)} placeholder="e.g. 90" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Runtime max (mins)</label>
            <input type="number" value={runtimeMax} onChange={(e) => setRuntimeMax(e.target.value)} placeholder="e.g. 150" className="input-field" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={runSearch} disabled={loading} className="btn-primary sm:w-auto px-8">
            {loading ? "Searching..." : "Search"}
          </button>
          <button onClick={handleReset} type="button" className="text-sm text-muted hover:text-cream transition-colors px-4">
            Reset filters
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-card border border-amber-dim/40 bg-amber/10 px-4 py-3 text-sm text-amber-soft">{error}</div>
      )}

      {hasSearched && !loading && results.length === 0 && !error && (
        <p className="text-muted text-sm">No movies matched those filters — try loosening one of them.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((movie) => (
          <MovieCard key={movie.id} movie={movie} genreMap={genreMap} onClick={(m) => navigate(`/movie/${m.id}`)} />
        ))}
      </div>
    </div>
  );
}