import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Link2,
  QrCode,
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Star,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  SkiperArrowLink,
  SkiperUnderlineLink,
} from "../components/SkiperNavLinks";

const showcaseLinks = [
  { slug: "/r/launch-2026", dest: "example.com/product-launch", clicks: "1,284" },
  { slug: "/r/bio", dest: "linkhub.io/bio/you", clicks: "862" },
  { slug: "/r/a3f9Kq", dest: "blog.example.com/q3-recap", clicks: "431" },
];

const showcaseBars = [35, 55, 42, 70, 58, 88, 100, 76, 92, 64, 80, 95];

function Login() {
  const { login, resendVerification, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get("verified") === "true";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendStatus, setResendStatus] = useState({ loading: false, message: "", token: null, verifyUrl: null, error: "" });
  const [verifiedSuccess, setVerifiedSuccess] = useState(
    justVerified ? "Email verified successfully! You can now log in." : ""
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setVerifiedSuccess(justVerified ? verifiedSuccess : "");
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
    <div className="relative overflow-hidden">
      {/* ambient background wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,var(--accent)_0%,transparent_70%)]"
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-10 lg:px-8">
        {/* ---------- Showcase panel ---------- */}
        <div
          className="animate-fade-up relative hidden overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground lg:flex lg:flex-col xl:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_0%,rgba(255,255,255,0.16),transparent)]"
          />
          <div
            aria-hidden
            className="animate-float-slow pointer-events-none absolute -top-14 -left-14 h-52 w-52 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="animate-float-slow pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-2xl [animation-delay:1.6s]"
          />

          <div className="relative flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground text-primary">
              <Link2 className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight">LinkHub</span>
          </div>

          <h2 className="relative mt-8 max-w-md text-3xl font-bold tracking-tight text-balance xl:text-4xl">
            Pick up right where your links left off.
          </h2>
          <p className="relative mt-3 max-w-md text-sm leading-6 text-primary-foreground/70">
            Vanity slugs, QR codes, bio pages, and live click analytics —
            waiting for you on the other side of this form.
          </p>

          {/* mini dashboard mock */}
          <div
            className="animate-float relative mt-8 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-sm xl:p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Recent links</p>
              <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-medium text-emerald-100">
                +12.4% clicks
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {showcaseLinks.map((l) => (
                <div
                  key={l.slug}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/10 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold">{l.slug}</p>
                    <p className="truncate text-[11px] text-primary-foreground/60">{l.dest}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold">{l.clicks}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex h-16 items-end gap-1.5" aria-hidden>
              {showcaseBars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 rounded-sm bg-white/25 last:bg-white/80"
                />
              ))}
            </div>
          </div>

          {/* floating badges */}
          <div className="animate-float relative mt-4 flex flex-wrap gap-2 [animation-delay:1.2s]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <QrCode className="h-3.5 w-3.5" /> QR ready
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <BarChart3 className="h-3.5 w-3.5" /> Live analytics
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure by default
            </span>
          </div>

          {/* testimonial */}
          <figure className="relative mt-auto pt-8">
            <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <blockquote className="mt-2 max-w-md text-sm leading-6 text-primary-foreground/80">
              “Replaced two tools on day one. Vanity slugs for launches, the bio
              page for my profile — analytics tells me what to post next.”
            </blockquote>
            <figcaption className="mt-2 text-xs font-medium text-primary-foreground/60">
              Maya R. · Newsletter creator
            </figcaption>
          </figure>
        </div>

        {/* ---------- Form column ---------- */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm py-2">
            <Link
              to="/"
              className="animate-fade-up inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>

            <div className="animate-fade-up mt-4" style={{ animationDelay: "80ms" }}>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="pulse-dot absolute h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Secure sign-in
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Log in to your LinkHub account
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="animate-fade-up mt-6 space-y-4"
              style={{ animationDelay: "160ms" }}
              noValidate
            >
              {verifiedSuccess && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300 overflow-safe" role="status">
                  <p className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{verifiedSuccess}</span>
                  </p>
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

                        <SkiperUnderlineLink
                          to="/verify-email"
                          className="text-xs font-medium"
                        >
                          Enter token manually
                        </SkiperUnderlineLink>
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
                  className="mt-1 block h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <SkiperUnderlineLink
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </SkiperUnderlineLink>
                </div>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block h-11 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md disabled:translate-y-0 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div
              className="animate-fade-up mt-6 flex items-center gap-3 text-xs text-muted-foreground"
              style={{ animationDelay: "240ms" }}
              aria-hidden
            >
              <span className="h-px flex-1 bg-border" />
              New to LinkHub?
              <span className="h-px flex-1 bg-border" />
            </div>

            <p
              className="animate-fade-up mt-4 text-center text-sm text-muted-foreground"
              style={{ animationDelay: "280ms" }}
            >
              <SkiperArrowLink
                to="/register"
                className="font-semibold text-foreground"
              >
                Create an account
              </SkiperArrowLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
