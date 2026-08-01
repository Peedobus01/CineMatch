import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import AuthVisualPanel from "../components/AuthVisualPanel";
import PasswordInput from "../components/PasswordInput";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "This reset link is invalid or has expired");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthVisualPanel
        eyebrow="Account recovery"
        headline="Choose a new password."
        sub="Make it something you'll remember — at least 6 characters."
      />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-display text-2xl font-semibold text-cream">CineMatch</span>
          </div>

          <h2 className="font-display text-3xl font-semibold text-cream mb-1">Reset password</h2>
          <p className="text-muted text-sm mb-8">
            <Link to="/login" className="text-amber hover:text-amber-soft">← Back to log in</Link>
          </p>

          {success ? (
            <div className="rounded-card border border-amber/40 bg-amber/10 px-4 py-4 text-sm text-cream leading-relaxed">
              Password reset successfully. Redirecting you to log in...
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
                  <label htmlFor="password" className="block text-sm text-muted mb-1.5">New password</label>
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm text-muted mb-1.5">Confirm new password</label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary mt-2">
                  {submitting ? "Resetting..." : "Reset password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}