import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Link2,
  BarChart3,
  QrCode,
  Palette,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  Star,
  MousePointerClick,
  Globe,
  Smartphone,
  Copy,
  Sparkles,
} from "lucide-react";

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const features = [
  {
    icon: Link2,
    title: "Branded short links",
    desc: "Auto-generated 6-char codes or custom vanity slugs like /r/launch-2026. Reserved names protected.",
  },
  {
    icon: BarChart3,
    title: "Click analytics",
    desc: "Timeline, referrers, and device breakdowns with 7-day defaults and 90-day ranges.",
  },
  {
    icon: QrCode,
    title: "QR codes built-in",
    desc: "Every short link gets an instant, downloadable QR. Scans track like normal clicks.",
  },
  {
    icon: Palette,
    title: "Link-in-bio pages",
    desc: "One public profile per user at /bio/you — avatar, theme, and up to 10 social links.",
  },
  {
    icon: Zap,
    title: "Lightning redirects",
    desc: "Indexed lookups with instant 302s. Analytics is fire-and-forget, never blocking.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    desc: "Verified emails, httpOnly JWT cookies, URL allowlists, and hashed IPs, not raw data.",
  },
];

const steps = [
  {
    n: "01",
    title: "Create your link",
    desc: "Paste a destination URL, pick a vanity slug or let us generate one. Live in milliseconds.",
  },
  {
    n: "02",
    title: "Share everywhere",
    desc: "Use the short URL, QR code, or add it to your bio page. No auth needed for visitors.",
  },
  {
    n: "03",
    title: "Measure & optimize",
    desc: "Watch clicks-over-time, top referrers, and devices update on your dashboard.",
  },
];

const marqueeItems = [
  "Vanity slugs",
  "QR downloads",
  "Bio pages",
  "Click timelines",
  "Referrer stats",
  "Device insights",
  "Custom themes",
  "Instant 302s",
];

function Home() {
  return (
    <div className="overflow-hidden">
      {/* ---------- HERO ---------- */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--accent)_0%,transparent_70%)]"
        />
        {/* soft floating blobs — white-theme neutrals only */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-float-slow absolute -top-10 left-[8%] h-56 w-56 rounded-full bg-neutral-200/50 blur-3xl" />
          <div className="animate-float-slow absolute top-24 right-[6%] h-64 w-64 rounded-full bg-stone-200/60 blur-3xl [animation-delay:1.4s]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28 lg:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              to="/register"
              className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                <Sparkles className="h-3 w-3" /> New
              </span>
              QR codes + bio pages are live
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <h1
              className="animate-fade-up mt-6 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.05]"
              style={{ animationDelay: "90ms" }}
            >
              Short links. Powerful analytics.
              <span className="block text-muted-foreground">One beautiful bio.</span>
            </h1>
            <p
              className="animate-fade-up mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
              style={{ animationDelay: "180ms" }}
            >
              LinkHub combines a Bitly-style shortener with a Linktree-style bio
              builder — branded URLs, QR codes, and per-link engagement analytics
              in a single dashboard.
            </p>
            <div
              className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: "260ms" }}
            >
              <Link
                to="/register"
                className="btn-arrow inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg sm:w-auto"
              >
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-border bg-card px-7 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-md sm:w-auto"
              >
                Log in to dashboard
              </Link>
            </div>
            <div
              className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm"
              style={{ animationDelay: "340ms" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="pulse-dot absolute h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <Check className="h-4 w-4 text-emerald-600" /> Free to start
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" /> No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" /> Custom slugs + QR
              </span>
            </div>
          </div>

          {/* Product mock */}
          <Reveal className="relative mx-auto mt-12 max-w-5xl sm:mt-16">
            {/* floating badges */}
            <div className="animate-float absolute -top-5 right-4 z-10 hidden items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-lg sm:flex lg:-right-6">
              <QrCode className="h-4 w-4" /> QR ready — print & scan
            </div>
            <div
              className="animate-float absolute -bottom-5 left-4 z-10 hidden items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-lg sm:flex lg:-left-6 [animation-delay:1.2s]"
            >
              <span className="relative flex h-2 w-2">
                <span className="pulse-dot absolute h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live click tracking
            </div>

            <div className="card-lift overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 hidden rounded-md bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground sm:block">
                  app.linkhub.io/dashboard
                </span>
              </div>
              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Link list mock */}
                <div className="border-b border-border p-4 sm:p-6 lg:border-r lg:border-b-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Recent links</p>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      +12.4% clicks
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { slug: "/r/launch-2026", dest: "example.com/product-launch", clicks: "1,284" },
                      { slug: "/r/bio", dest: "linkhub.io/bio/you", clicks: "862" },
                      { slug: "/r/a3f9Kq", dest: "blog.example.com/q3-recap", clicks: "431" },
                    ].map((l) => (
                      <div
                        key={l.slug}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-3 transition-colors hover:border-foreground/20"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-sm font-semibold text-foreground">
                            {l.slug}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{l.dest}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-semibold text-foreground">{l.clicks}</span>
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="group mt-4 flex items-center gap-2 rounded-lg bg-muted/60 px-3.5 py-3 transition-colors hover:bg-muted">
                    <Link2 className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:scale-110" />
                    <span className="truncate text-sm text-muted-foreground">
                      Paste a long URL to shorten it…
                    </span>
                    <span className="ml-auto hidden shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground sm:block">
                      Shorten
                    </span>
                  </div>
                </div>
                {/* Analytics mini mock */}
                <div className="bg-muted/30 p-4 sm:p-6">
                  <p className="text-sm font-semibold text-foreground">Clicks — last 7 days</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    2,577 <span className="text-sm font-medium text-muted-foreground">total</span>
                  </p>
                  <div className="mt-4 flex h-28 items-end gap-1.5">
                    {[35, 55, 42, 70, 58, 88, 100, 76, 92, 64, 80, 95].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
                        className={`bar-grow flex-1 rounded-sm ${i === 6 ? "bg-primary" : "bg-primary/20"}`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-border bg-card p-2.5 transition-shadow hover:shadow-sm">
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Globe className="h-3.5 w-3.5" /> Top referrer
                      </p>
                      <p className="mt-1 font-semibold text-foreground">twitter.com</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5 transition-shadow hover:shadow-sm">
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Smartphone className="h-3.5 w-3.5" /> Top device
                      </p>
                      <p className="mt-1 font-semibold text-foreground">Mobile · 68%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Marquee strip */}
          <Reveal delay={100} className="relative mx-auto mt-10 max-w-5xl">
            <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="animate-marquee flex w-max items-center gap-2.5 pr-2.5">
                {[...marqueeItems, ...marqueeItems].map((item, i) => (
                  <span
                    key={`${item}-${i}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Social proof */}
          <Reveal className="mx-auto mt-10 max-w-3xl text-center">
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="animate-fade-up h-4 w-4 fill-amber-400 text-amber-400"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-foreground">
                Loved by creators & small teams
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Short links, QR codes, bio pages, and analytics — without juggling three tools.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Everything in one hub
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Built for sharing, tuned for insight
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              One authenticated platform for links, QR, bio, and analytics — with
              ownership-scoped data and privacy-friendly tracking.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="card-lift group h-full rounded-xl border border-border bg-card p-5 sm:p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how-it-works" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              How it works
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              From long URL to insight in seconds
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:gap-6 lg:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 110}>
                <div className="card-lift relative h-full rounded-xl border border-border bg-card p-5 sm:p-6">
                  <span className="font-mono text-sm font-bold text-muted-foreground">{s.n}</span>
                  <h3 className="mt-2 text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{s.desc}</p>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-5 right-5 h-8 w-8 rounded-full bg-muted/70 transition-transform duration-300"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- SHOWCASE / SPLIT ---------- */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl space-y-12 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-foreground">
                <MousePointerClick className="h-3.5 w-3.5" /> Analytics
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Know exactly what&apos;s working
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Every redirect records a click event with referrer, device, and a
                hashed IP — then aggregates into overview, timeline, and top-source
                views scoped only to your links.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-foreground">
                {[
                  "Zero-filled daily timelines — no gaps in charts",
                  "Referrer + device breakdowns with percentages",
                  "Per-link drill-downs and 90-day date filtering",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="btn-arrow mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:underline"
              >
                Start tracking clicks <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <Reveal delay={120}>
              <div className="card-lift rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">Devices</span>
                  <span className="text-xs text-muted-foreground">Last 7 days</span>
                </div>
                {[
                  { label: "Mobile", pct: 68, bar: "w-[68%]" },
                  { label: "Desktop", pct: 24, bar: "w-[24%]" },
                  { label: "Tablet", pct: 8, bar: "w-[8%]" },
                ].map((d) => (
                  <div key={d.label} className="mt-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="font-medium text-foreground">{d.label}</span>
                      <span className="text-muted-foreground">{d.pct}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div className={`h-2 rounded-full bg-primary transition-all duration-1000 ${d.bar}`} />
                    </div>
                  </div>
                ))}
                <div className="mt-5 rounded-lg bg-muted/60 p-3.5 text-xs leading-5 text-muted-foreground">
                  Privacy-friendly: raw IPs are never stored — only SHA-256 hashes. No
                  geography tracking, no fingerprinting.
                </div>
              </div>
            </Reveal>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <Reveal className="order-2 lg:order-1">
              <div className="card-lift mx-auto max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                <div className="animate-float mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  Y
                </div>
                <p className="mt-3 font-semibold text-foreground">@you</p>
                <p className="text-sm text-muted-foreground">Creator · Weekly drops + behind the scenes</p>
                <div className="mt-4 space-y-2.5">
                  {["Latest video", "Newsletter", "Merch drop"].map((l) => (
                    <div
                      key={l}
                      className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <p className="mt-4 font-mono text-xs text-muted-foreground">linkhub.io/bio/you</p>
              </div>
            </Reveal>
            <Reveal delay={120} className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-foreground">
                <Palette className="h-3.5 w-3.5" /> Link-in-bio
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                One link for everything you make
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Claim a unique username, add up to 10 social links, pick from three
                themes, and preview live as you edit. Public pages need no login.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-foreground">
                {[
                  "Unique, reserved-name-protected usernames",
                  "Live editor with instant theme preview",
                  "Public, fast-loading pages at /bio/:username",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Creators ship faster with LinkHub
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Short links for campaigns, QR for offline, bio for profile — one login.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:gap-6 lg:grid-cols-3">
            {[
              {
                quote:
                  "Replaced two tools on day one. Vanity slugs for launches + the bio page for my profile — analytics tells me what to post next.",
                name: "Maya R.",
                role: "Newsletter creator",
              },
              {
                quote:
                  "QR codes that just track as clicks is such a small thing that saves so much time at events. Print, scan, done.",
                name: "Devon K.",
                role: "Indie maker",
              },
              {
                quote:
                  "The per-link analytics are refreshingly simple. Timeline, referrers, devices — exactly what I need, nothing I don't.",
                name: "Sofia L.",
                role: "Social media manager",
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 110}>
                <figure className="card-lift h-full rounded-xl border border-border bg-card p-5 sm:p-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-sm leading-6 text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <span className="text-muted-foreground"> · {t.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-12 text-center sm:px-12 sm:py-16">
              <div
                aria-hidden
                className="animate-float-slow pointer-events-none absolute -top-16 left-[10%] h-48 w-48 rounded-full bg-white/10 blur-2xl"
              />
              <div
                aria-hidden
                className="animate-float-slow pointer-events-none absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-white/10 blur-2xl [animation-delay:1.6s]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(255,255,255,0.15),transparent)]"
              />
              <h2 className="relative text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
                Claim your short links today
              </h2>
              <p className="relative mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
                Register, verify your email, and create your first branded link and bio
                page in under two minutes.
              </p>
              <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="btn-arrow inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-background px-7 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                >
                  Get started for free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-primary-foreground/25 px-7 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-foreground/10 sm:w-auto"
                >
                  Log in
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default Home;
