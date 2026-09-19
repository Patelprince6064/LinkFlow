import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Short links. Powerful analytics.
            <br />
            <span className="text-muted-foreground">One beautiful bio.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Create branded short links, track every click with detailed analytics,
            and build a stunning link-in-bio page — all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started for free
            </Link>
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-2xl font-bold text-foreground">URL Shortening</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate short links with custom vanity slugs or auto-generated codes.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-2xl font-bold text-foreground">Click Analytics</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Track referrers, devices, locations, and engagement over time.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-2xl font-bold text-foreground">Link-in-Bio</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Build a customizable bio page with all your important links.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
