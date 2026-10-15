import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Link2,
  Palette,
  QrCode,
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Star,
  ArrowLeft,
  PartyPopper,
  MailCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  SkiperArrowLink,
  SkiperUnderlineLink,
} from "../components/SkiperNavLinks";
import { cn } from "../lib/utils";

const perks = [
  { icon: Link2, text: "Vanity slugs like /r/launch-2026" },
  { icon: QrCode, text: "QR codes for every short link" },
  { icon: Palette, text: "Your bio page at /bio/you" },
  { icon: BarChart3, text: "Click analytics from day one" },
];

function strengthOf(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return score;
}

const strengthLabels = ["Too weak", "Weak", "Fair", "Strong", "Elite"];
const strengthColors = [
  "bg-destructive",
  "bg-destructive",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-emerald-500",
];

function Register() {
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredToken, setRegisteredToken] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleInstantVerify = async () => {
    if (!registeredToken) return;
    setVerifying(true);
    try {
      await verifyEmail(registeredToken);
      navigate("/login?verified=true");
    } catch {
      setError("Verification failed. Please try again.");
      setSuccess("");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await register(formData.name, formData.email, formData.password);
      if (res?.data?.token) {
        setRegisteredToken(res.data.token);
        setSuccess("Registration successful! Click the button below to verify and activate your account.");
      } else {
        setSuccess("Registration successful! Check your inbox for the email verification link.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = strengthOf(formData.password);
  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  if (success) {
    return (
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,var(--accent)_0%,transparent_70%)]"
        />
        <div className="mx-auto flex max-w-lg justify-center px-4 py-10 sm:px-6 sm:py-14">
          <div className="animate-fade-up w-full rounded-3xl border border-border bg-card p-6 text-center shadow-xl shadow-black/5 sm:p-8">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              {registeredToken ? (
                <PartyPopper className="h-6 w-6" />
              ) : (
                <MailCheck className="h-6 w-6" />
              )}
            </span>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {registeredToken ? "Activate your account" : "Check your email"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground overflow-safe">{success}</p>

            {registeredToken ? (
              <button
                type="button"
                onClick={handleInstantVerify}
                disabled={verifying}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md disabled:translate-y-0 disabled:opacity-50"
              >
                {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
                {verifying ? "Verifying..." : "Verify & Activate Account Now"}
              </button>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                <SkiperUnderlineLink to="/verify-email" className="font-medium text-foreground">
                  Didn&apos;t get the email? Resend the link
                </SkiperUnderlineLink>
              </p>
            )}

            <p className="mt-4">
              <SkiperArrowLink to="/login" className="text-sm font-semibold text-foreground">
                Go to login
              </SkiperArrowLink>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* ambient background wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,var(--accent)_0%,transparent_70%)]"
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-10 lg:px-8">
        {/* ---------- Form column (left on register, mirrored vs login) ---------- */}
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
                Free to start · No credit card
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Start creating short links today
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="animate-fade-up mt-6 space-y-4"
              style={{ animationDelay: "160ms" }}
              noValidate
            >
              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground overflow-safe" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="Your name"
                />
              </div>

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
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block h-11 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    placeholder="At least 8 characters"
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
                {formData.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1" aria-hidden>
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            i <= strength - 1 ? strengthColors[strength] : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Strength:{" "}
                      <span className="font-medium text-foreground">
                        {strengthLabels[strength]}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                  Confirm password
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block h-11 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    aria-pressed={showConfirm}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordsMatch && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <Check className="h-3.5 w-3.5" /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md disabled:translate-y-0 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div
              className="animate-fade-up mt-6 flex items-center gap-3 text-xs text-muted-foreground"
              style={{ animationDelay: "240ms" }}
              aria-hidden
            >
              <span className="h-px flex-1 bg-border" />
              Already have an account?
              <span className="h-px flex-1 bg-border" />
            </div>

            <p
              className="animate-fade-up mt-4 text-center text-sm text-muted-foreground"
              style={{ animationDelay: "280ms" }}
            >
              <SkiperArrowLink to="/login" className="font-semibold text-foreground">
                Log in instead
              </SkiperArrowLink>
            </p>
          </div>
        </div>

        {/* ---------- Showcase panel (right on register, mirrored vs login) ---------- */}
        <div className="animate-fade-up relative hidden overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground lg:flex lg:flex-col xl:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,rgba(255,255,255,0.16),transparent)]"
          />
          <div
            aria-hidden
            className="animate-float-slow pointer-events-none absolute -top-14 -right-14 h-52 w-52 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="animate-float-slow pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl [animation-delay:1.6s]"
          />

          <h2 className="relative max-w-md text-3xl font-bold tracking-tight text-balance xl:text-4xl">
            One login. Every link you&apos;ll ever share.
          </h2>
          <p className="relative mt-3 max-w-md text-sm leading-6 text-primary-foreground/70">
            Join creators and small teams running launches, QR campaigns, and
            bio pages from a single hub.
          </p>

          {/* bio-page mock */}
          <div className="animate-float relative mx-auto mt-8 w-full max-w-xs rounded-2xl border border-white/15 bg-white/10 p-5 text-center shadow-xl backdrop-blur-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground text-lg font-bold text-primary">
              Y
            </div>
            <p className="mt-2 text-sm font-semibold">@you</p>
            <p className="text-xs text-primary-foreground/60">Creator · Weekly drops</p>
            <div className="mt-3 space-y-2">
              {["Latest video", "Newsletter", "Merch drop"].map((l) => (
                <div
                  key={l}
                  className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-xs font-medium"
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="mt-3 font-mono text-[11px] text-primary-foreground/60">
              linkhub.io/bio/you
            </p>
          </div>

          {/* perks */}
          <ul className="relative mt-6 space-y-2.5">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-2.5 text-sm text-primary-foreground/85">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <p.icon className="h-3.5 w-3.5" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>

          {/* testimonial */}
          <figure className="relative mt-auto pt-8">
            <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <blockquote className="mt-2 max-w-md text-sm leading-6 text-primary-foreground/80">
              “QR codes that just track as clicks is such a small thing that
              saves so much time at events. Print, scan, done.”
            </blockquote>
            <figcaption className="mt-2 text-xs font-medium text-primary-foreground/60">
              Devon K. · Indie maker
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}

export default Register;
