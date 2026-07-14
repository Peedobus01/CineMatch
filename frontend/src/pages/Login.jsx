import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthVisualPanel from "../components/AuthVisualPanel";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthVisualPanel
        eyebrow="Welcome back"
        headline="Pick up right where your taste left off."
        sub="Your ratings, watchlist, and recommendations are all waiting — structured, searchable, and yours."
      />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-display text-2xl font-semibold text-cream">
              CineMatch
            </span>
          </div>

          <h2 className="font-display text-3xl font-semibold text-cream mb-1">
            Log in
          </h2>
          <p className="text-muted text-sm mb-8">
            New here?{" "}
            <Link to="/register" className="text-amber hover:text-amber-soft">
              Create an account
            </Link>
          </p>

          {error && (
            <div className="mb-5 rounded-card border border-amber-dim/40 bg-amber/10 px-4 py-3 text-sm text-amber-soft">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-muted mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary mt-2">
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
