import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthVisualPanel from "../components/AuthVisualPanel";
import PasswordInput from "../components/PasswordInput";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthVisualPanel
        eyebrow="Get started"
        headline="Structured filters. Real ratings. Zero noise."
        sub="Tell CineMatch what you love once, and every recommendation after that gets sharper."
      />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-display text-2xl font-semibold text-cream">CineMatch</span>
          </div>

          <h2 className="font-display text-3xl font-semibold text-cream mb-1">Create your account</h2>
          <p className="text-muted text-sm mb-8">
            Already have one? <Link to="/login" className="text-amber hover:text-amber-soft">Log in</Link>
          </p>

          {error && (
            <div className="mb-5 rounded-card border border-amber-dim/40 bg-amber/10 px-4 py-3 text-sm text-amber-soft">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm text-muted mb-1.5">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Alex Rivera"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-muted mb-1.5">Email</label>
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
              <label htmlFor="password" className="block text-sm text-muted mb-1.5">Password</label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary mt-2">
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}