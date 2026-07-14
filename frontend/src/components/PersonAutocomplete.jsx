import { useState, useEffect, useRef } from "react";
import movieService from "../services/movieService";
import { profileUrl } from "../utils/tmdbImage";

export default function PersonAutocomplete({ selected, onChange, placeholder, maxSelected = 5 }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const people = await movieService.searchPerson(query.trim());
        setResults(people.slice(0, 6));
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (person) => {
    if (selected.some((p) => p.id === person.id)) return;
    if (selected.length >= maxSelected) return;
    onChange([...selected, { id: person.id, name: person.name }]);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleRemove = (id) => {
    onChange(selected.filter((p) => p.id !== id));
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="input-field"
      />

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-surfaceRaised border border-border rounded-card overflow-hidden shadow-lg">
          {results.map((person) => (
            <button key={person.id} type="button" onMouseDown={() => handleSelect(person)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface text-left transition-colors">
              {profileUrl(person.profile_path) ? (
                <img src={profileUrl(person.profile_path)} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-border" />
              )}
              <span className="text-sm text-cream">{person.name}</span>
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((p) => (
            <span key={p.id} className="flex items-center gap-1.5 bg-surfaceRaised border border-border rounded-full pl-3 pr-2 py-1 text-xs text-cream">
              {p.name}
              <button type="button" onClick={() => handleRemove(p.id)} className="text-muted hover:text-amber leading-none" aria-label={`Remove ${p.name}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}