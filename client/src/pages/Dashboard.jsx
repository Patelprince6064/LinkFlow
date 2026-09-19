import { useAuth } from "../contexts/AuthContext";
import { useLinks } from "../hooks/useLinks";
import { useAnalyticsOverview } from "../hooks/useAnalytics";
import { StatCardSkeleton } from "../components/common/UIComponents";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user } = useAuth();
  const linksData = useLinks({ page: 1, limit: 50 });
  const analytics = useAnalyticsOverview({});

  const totalLinks = linksData.data?.pagination?.total ?? 0;
  const totalClicks = analytics.data?.totalClicks ?? 0;
  const activeLinks = analytics.data?.activeLinks ?? 0;
  const topLink = analytics.data?.topLink;
  const isLoading = linksData.isLoading || analytics.isLoading;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back, {user?.name || "User"}.
      </p>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Links</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalLinks}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalClicks}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Active Links</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{activeLinks}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Top Link</p>
            {topLink ? (
              <>
                <p className="mt-1 text-2xl font-bold font-mono text-foreground">/{topLink.shortCode}</p>
                <p className="text-xs text-muted-foreground">{topLink.clicks} clicks</p>
              </>
            ) : (
              <p className="mt-1 text-2xl font-bold text-foreground">&mdash;</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/dashboard/links"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Manage Links
        </Link>
        <Link
          to="/dashboard/analytics"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          View Analytics
        </Link>
        <Link
          to="/dashboard/bio"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          Edit Bio
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-foreground">Account Details</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="mt-0.5 text-foreground">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-0.5 text-foreground">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd className="mt-0.5 capitalize text-foreground">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email Verified</dt>
            <dd className="mt-0.5 text-foreground">{user?.isEmailVerified ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default Dashboard;
