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
    <div className="pb-4">
      <h1 className="text-xl font-bold text-foreground sm:text-2xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back, {user?.name || "User"}.
      </p>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <StatCard title="Total Links" value={totalLinks} />
          <StatCard title="Total Clicks" value={totalClicks} />
          <StatCard title="Active Links" value={activeLinks} />
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <p className="text-xs text-muted-foreground sm:text-sm">Top Link</p>
            {topLink ? (
              <>
                <p className="mt-1 text-lg font-bold font-mono text-foreground truncate sm:text-2xl">/{topLink.shortCode}</p>
                <p className="text-xs text-muted-foreground">{topLink.clicks} clicks</p>
              </>
            ) : (
              <p className="mt-1 text-lg font-bold text-foreground sm:text-2xl">&mdash;</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
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

      <div className="mt-6 rounded-lg border border-border bg-card p-4 sm:mt-8 sm:p-6">
        <h2 className="text-sm font-medium text-foreground">Account Details</h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="mt-0.5 text-foreground overflow-safe">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-0.5 text-foreground overflow-safe">{user?.email}</dd>
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

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <p className="text-xs text-muted-foreground sm:text-sm">{title}</p>
      <p className="mt-1 text-lg font-bold text-foreground sm:text-2xl">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default Dashboard;
