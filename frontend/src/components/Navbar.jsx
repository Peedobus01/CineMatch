import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navLinkClasses = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-amber" : "text-muted hover:text-cream"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
          {/* Signature mark: a film-leader countdown ring */}
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="13" stroke="#E8A33D" strokeWidth="1.5" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 15 + 11 * Math.sin(angle);
              const y1 = 15 - 11 * Math.cos(angle);
              const x2 = 15 + 13 * Math.sin(angle);
              const y2 = 15 - 13 * Math.cos(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#E8A33D"
                  strokeWidth="1.2"
                />
              );
            })}
            <text
              x="15"
              y="19.5"
              textAnchor="middle"
              fontFamily="'IBM Plex Mono', monospace"
              fontSize="11"
              fill="#EDEAE3"
            >
              C
            </text>
          </svg>
          <span className="font-display font-semibold text-lg tracking-tight">
            CineMatch
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" className={navLinkClasses} end>
            Home
          </NavLink>
          <NavLink to="/discover" className={navLinkClasses}>
            Discover
          </NavLink>
          <NavLink to="/watchlist" className={navLinkClasses}>
            Watchlist
          </NavLink>
          <NavLink to="/recommendations" className={navLinkClasses}>
            For You
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NavLink
                to="/profile"
                className="text-sm font-medium text-muted hover:text-cream transition-colors"
              >
                {user.name?.split(" ")[0]}
              </NavLink>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted hover:text-amber transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="text-sm font-semibold bg-amber text-ink px-4 py-2 rounded-card hover:bg-amber-soft transition-colors"
            >
              Log in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
