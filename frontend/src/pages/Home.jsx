import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import movieService from "../services/movieService";
import MovieRow from "../components/MovieRow";

export default function Home() {
  const { user } = useAuth();
  const [genres, setGenres] = useState([]);
  const [sections, setSections] = useState({
    trending: [],
    mostPopular: [],
    topRated: [],
    nowPlaying: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [genreList, trending, mostPopular, topRated, nowPlaying] = await Promise.all([
          movieService.getGenres(),
          movieService.getTrending(),
          movieService.getMostPopular(),
          movieService.getTopRated(),
          movieService.getNowPlaying(),
        ]);
        if (cancelled) return;
        setGenres(genreList);
        setSections({ trending, mostPopular, topRated, nowPlaying });
      } catch {
        // Sections that fail to load just render empty - homepage shouldn't hard-fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const genreMap = Object.fromEntries(genres.map((g) => [g.id, g.name]));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="font-mono text-xs tracking-[0.2em] text-amber uppercase mb-3">Welcome back</p>
      <h1 className="font-display text-4xl font-semibold text-cream mb-10">
        Hey {user?.name?.split(" ")[0]}, ready for something new?
      </h1>

      {loading ? (
        <p className="text-muted font-mono text-sm">Loading movies...</p>
      ) : (
        <>
          <MovieRow title="Trending This Week" movies={sections.trending} genreMap={genreMap} />
          <MovieRow title="Most Popular" movies={sections.mostPopular} genreMap={genreMap} />
          <MovieRow title="Top Rated" movies={sections.topRated} genreMap={genreMap} />
          <MovieRow title="Recently Released" movies={sections.nowPlaying} genreMap={genreMap} />
        </>
      )}
    </div>
  );
}