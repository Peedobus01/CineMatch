import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import AuthVisualPanel from "../components/AuthVisualPanel";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthVisualPanel
        eyebrow="Account recovery"
        headline="Locked out? We'll get you back in."
        sub="Enter your email and we'll send a link to reset your password."
      />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-display text-2xl font-semibold text-cream">CineMatch</span>
          </div>

          <h2 className="font-display text-3xl font-semibold text-cream mb-1">Forgot password</h2>
          <p className="text-muted text-sm mb-8">
            <Link to="/login" className="text-amber hover:text-amber-soft">← Back to log in</Link>
          </p>

          {submitted ? (
            <div className="rounded-card border border-amber/40 bg-amber/10 px-4 py-4 text-sm text-cream leading-relaxed">
              If an account with that email exists, a reset link has been sent. Check your inbox
              (and spam folder) — the link expires in 15 minutes.
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded-card border border-amber-dim/40 bg-amber/10 px-4 py-3 text-sm text-amber-soft">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-muted mb-1.5">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary mt-2">
                  {submitting ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}