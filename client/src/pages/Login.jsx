import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const { login, resendVerification, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState({ loading: false, message: "", token: null, verifyUrl: null, error: "" });
  const [verifiedSuccess, setVerifiedSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setVerifiedSuccess("");
  };

  const isUnverified = error.toLowerCase().includes("verify your email") || error.toLowerCase().includes("unverified");

  const handleResend = async () => {
    if (!formData.email) {
      setError("Please enter your email address to resend verification.");
      return;
    }
    setResendStatus({ loading: true, message: "", token: null, verifyUrl: null, error: "" });
    try {
      const res = await resendVerification(formData.email);
      setResendStatus({
        loading: false,
        message: res.message || "Verification request processed.",
        token: res.token || null,
        verifyUrl: res.verifyUrl || null,
        error: "",
      });
    } catch (err) {
      setResendStatus({
        loading: false,
        message: "",
        token: null,
        verifyUrl: null,
        error: err.response?.data?.message || "Failed to resend verification email.",
      });
    }
  };

  const handleInstantVerify = async () => {
    if (!resendStatus.token) return;
    setResendStatus((prev) => ({ ...prev, loading: true }));
    try {
      await verifyEmail(resendStatus.token);
      setVerifiedSuccess("Email verified successfully! You can now log in.");
      setError("");
      setResendStatus({ loading: false, message: "", token: null, verifyUrl: null, error: "" });
    } catch (err) {
      setResendStatus((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || "Verification failed. Please try again.",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVerifiedSuccess("");

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to your LinkHub account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8" noValidate>
          {verifiedSuccess && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300 overflow-safe" role="status">
              {verifiedSuccess}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground overflow-safe" role="alert">
              <p>{error}</p>

              {isUnverified && (
                <div className="mt-3 space-y-2 border-t border-destructive/20 pt-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendStatus.loading}
                      className="inline-flex h-8 items-center justify-center rounded bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {resendStatus.loading ? "Requesting..." : "Resend verification link"}
                    </button>

                    <Link
                      to="/verify-email"
                      className="text-xs font-medium text-foreground underline hover:text-primary transition-colors"
                    >
                      Enter token manually
                    </Link>
                  </div>

                  {resendStatus.message && (
                    <p className="text-xs text-foreground/80">{resendStatus.message}</p>
                  )}

                  {resendStatus.token && (
                    <button
                      type="button"
                      onClick={handleInstantVerify}
                      disabled={resendStatus.loading}
                      className="inline-flex h-8 w-full items-center justify-center rounded bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {resendStatus.loading ? "Verifying..." : "Verify Account Now (1-Click)"}
                    </button>
                  )}

                  {resendStatus.error && (
                    <p className="text-xs text-destructive-foreground">{resendStatus.error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Your password"
            />
          </div>

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
