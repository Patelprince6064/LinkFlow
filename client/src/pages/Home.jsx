import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-6xl">
            Short links. Powerful analytics.
            <br />
            <span className="text-muted-foreground">One beautiful bio.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
            Create branded short links, track every click with detailed analytics,
            and build a stunning link-in-bio page — all in one place.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-x-6">
            <Link
              to="/register"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors sm:w-auto"
            >
              Get started for free
            </Link>
            <Link
              to="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-accent transition-colors sm:w-auto"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="text-lg font-bold text-foreground sm:text-2xl">URL Shortening</div>
            <p className="mt-2 text-sm text-muted-foreground overflow-safe">
              Generate short links with custom vanity slugs or auto-generated codes.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="text-lg font-bold text-foreground sm:text-2xl">Click Analytics</div>
            <p className="mt-2 text-sm text-muted-foreground overflow-safe">
              Track referrers, devices, locations, and engagement over time.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="text-lg font-bold text-foreground sm:text-2xl">Link-in-Bio</div>
            <p className="mt-2 text-sm text-muted-foreground overflow-safe">
              Build a customizable bio page with all your important links.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
