import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "./MovieCard";

export default function MovieRow({ title, movies, genreMap }) {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!movies?.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-semibold text-cream">{title}</h2>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scroll("left")} aria-label="Scroll left" className="w-8 h-8 rounded-full border border-border text-muted hover:text-cream hover:border-cream/40 flex items-center justify-center transition-colors">‹</button>
          <button onClick={() => scroll("right")} aria-label="Scroll right" className="w-8 h-8 rounded-full border border-border text-muted hover:text-cream hover:border-cream/40 flex items-center justify-center transition-colors">›</button>
        </div>
      </div>

      
      <div ref={scrollRef} className="flex items-start gap-4 overflow-x-auto pb-2 scroll-smooth snap-x">
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-[160px] snap-start">
            <MovieCard movie={movie} genreMap={genreMap} onClick={(m) => navigate(`/movie/${m.id}`)} />
          </div>
        ))}
      </div>
    </section>
  );
}