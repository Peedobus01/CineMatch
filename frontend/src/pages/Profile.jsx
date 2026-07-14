import { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import profileService from "../services/profileService";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CHART_COLORS = ["#E8A33D", "#C7842A", "#F4C878", "#8B8B93", "#4A4B4F", "#2E2F33"];

function StatBlock({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-card px-4 py-3">
      <p className="text-2xl font-display font-semibold text-cream">{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}

function TagList({ items, nameKey }) {
  if (!items?.length) return <p className="text-muted text-sm">Not enough ratings yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, 6).map((item) => (
        <span key={item[nameKey === "genreName" ? "genreId" : "personId"]} className="text-xs px-3 py-1.5 rounded-full border border-border text-cream">
          {item[nameKey]}
        </span>
      ))}
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService
      .getMyProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-muted font-mono text-sm">Loading...</div>;
  }
  if (!profile) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-amber-soft">Couldn't load your profile.</div>;
  }

  const genreChartData = {
    labels: profile.favouriteGenres.slice(0, 6).map((g) => g.genreName),
    datasets: [
      {
        data: profile.favouriteGenres.slice(0, 6).map((g) => g.score),
        backgroundColor: CHART_COLORS,
        borderColor: "#121214",
        borderWidth: 2,
      },
    ],
  };

  const ratingChartData = {
    labels: profile.ratingDistribution.map((r) => `${r.star}★`),
    datasets: [
      {
        data: profile.ratingDistribution.map((r) => r.count),
        backgroundColor: "#E8A33D",
        borderRadius: 4,
      },
    ],
  };

  const chartTextColor = "#8B8B93";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-surfaceRaised border border-border flex items-center justify-center text-2xl font-display text-amber">
          {profile.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">{profile.name}</h1>
          <p className="text-muted text-sm">{profile.email}</p>
          <p className="text-muted text-xs font-mono mt-0.5">
            Joined {new Date(profile.accountCreatedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatBlock label="Movies rated" value={profile.totalMoviesRated} />
        <StatBlock label="Avg. rating given" value={profile.averageRatingGiven?.toFixed(1) || "—"} />
        <StatBlock label="Watchlist" value={profile.watchlistCount} />
        <StatBlock label="Reviews written" value={profile.reviewCount} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div>
          <h3 className="text-sm text-muted mb-2">Favourite genres</h3>
          <TagList items={profile.favouriteGenres} nameKey="genreName" />
        </div>
        <div>
          <h3 className="text-sm text-muted mb-2">Favourite directors</h3>
          <TagList items={profile.favouriteDirectors} nameKey="name" />
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-sm text-muted mb-2">Favourite actors</h3>
        <TagList items={profile.favouriteActors} nameKey="name" />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-card p-5">
          <h3 className="text-sm text-muted mb-4">Genre distribution</h3>
          {profile.favouriteGenres.length > 0 ? (
            <Pie
              data={genreChartData}
              options={{
                plugins: { legend: { position: "bottom", labels: { color: chartTextColor, boxWidth: 12, font: { size: 11 } } } },
              }}
            />
          ) : (
            <p className="text-muted text-sm">Rate a few movies to see this chart.</p>
          )}
        </div>

        <div className="bg-surface border border-border rounded-card p-5">
          <h3 className="text-sm text-muted mb-4">Rating distribution</h3>
          <Bar
            data={ratingChartData}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: chartTextColor }, grid: { color: "#2E2F33" } },
                y: { ticks: { color: chartTextColor, stepSize: 1 }, grid: { color: "#2E2F33" } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}