import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAnalyticsOverview, useClicksOverTime, useTopReferrers, useDeviceDistribution } from "../hooks/useAnalytics";
import { useLinks } from "../hooks/useLinks";
import { StatCardSkeleton, ChartSkeleton, EmptyState } from "../components/common/UIComponents";

const DATE_PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const DEVICE_COLORS = { Desktop: "#3b82f6", Mobile: "#22c55e", Tablet: "#f59e0b" };

function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function Analytics() {
  const [datePreset, setDatePreset] = useState(7);
  const [linkSearch, setLinkSearch] = useState("");
  const [showAllLinks, setShowAllLinks] = useState(false);
  const { startDate, endDate } = useMemo(() => getDateRange(datePreset), [datePreset]);

  const overview = useAnalyticsOverview({ startDate, endDate });
  const clicksOverTime = useClicksOverTime({ startDate, endDate });
  const referrers = useTopReferrers({ startDate, endDate, limit: 8 });
  const devices = useDeviceDistribution({ startDate, endDate });
  const linksData = useLinks({ page: 1, limit: 100 });

  const allLinks = useMemo(() => {
    const links = linksData.data?.links ?? [];
    return [...links].sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0));
  }, [linksData.data]);

  const filteredLinks = useMemo(() => {
    const q = linkSearch.trim().toLowerCase();
    if (!q) return allLinks;
    return allLinks.filter(
      (link) =>
        link.shortCode?.toLowerCase().includes(q) ||
        link.destinationUrl?.toLowerCase().includes(q)
    );
  }, [allLinks, linkSearch]);

  const visibleLinks = showAllLinks ? filteredLinks : filteredLinks.slice(0, 8);
  const totalLinkCount = linksData.data?.pagination?.total ?? allLinks.length;

  const isLoading = overview.isLoading || clicksOverTime.isLoading || referrers.isLoading || devices.isLoading;

  const refreshAll = () => {
    overview.refetch();
    clicksOverTime.refetch();
    referrers.refetch();
    devices.refetch();
  };

  return (
    <div className="pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track how your short links are performing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.days}
                onClick={() => setDatePreset(preset.days)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors touch-target ${
                  datePreset === preset.days
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground hover:bg-accent"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <button
            onClick={refreshAll}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-3 text-sm text-foreground hover:bg-accent transition-colors touch-target"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <ChartSkeleton />
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <StatCard title="Total Clicks" value={overview.data?.totalClicks ?? 0} />
            <StatCard title="Total Links" value={overview.data?.totalLinks ?? 0} />
            <StatCard title="Active Links" value={overview.data?.activeLinks ?? 0} />
            <StatCard
              title="Top Link"
              value={overview.data?.topLink ? `/${overview.data.topLink.shortCode}` : "\u2014"}
              subtitle={overview.data?.topLink ? `${overview.data.topLink.clicks} clicks` : "No clicks yet"}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
              <h2 className="text-sm font-medium text-foreground">Clicks Over Time</h2>
              {clicksOverTime.data && clicksOverTime.data.some((d) => d.clicks > 0) ? (
                <div className="mt-4 h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={clicksOverTime.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        tickFormatter={(v) => v.slice(5)}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} allowDecimals={false} width={30} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                      />
                      <Line type="monotone" dataKey="clicks" stroke="var(--primary)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title="No click data yet"
                  description="Share your short links to start collecting analytics."
                />
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Device Distribution</h2>
              {devices.data && devices.data.some((d) => d.clicks > 0) ? (
                <div className="mt-4">
                  <div className="h-40 sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={devices.data.filter((d) => d.clicks > 0)}
                          dataKey="clicks"
                          nameKey="deviceType"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          innerRadius={30}
                        >
                          {devices.data
                            .filter((d) => d.clicks > 0)
                            .map((entry) => (
                              <Cell key={entry.deviceType} fill={DEVICE_COLORS[entry.deviceType]} />
                            ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 space-y-1">
                    {devices.data.map((d) => (
                      <div key={d.deviceType} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEVICE_COLORS[d.deviceType] }} />
                          {d.deviceType}
                        </span>
                        <span className="text-muted-foreground">{d.clicks} ({d.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No device data yet"
                  description="Device info appears after your links receive clicks."
                />
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Top Referrers</h2>
              {referrers.data && referrers.data.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {referrers.data.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="min-w-0 flex-1 truncate text-foreground overflow-safe">{r.referrer}</span>
                      <span className="ml-2 shrink-0 text-muted-foreground">{r.clicks}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No referrer data yet"
                  description="Referrer info appears when people click your links from other sites."
                />
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-foreground">
                  Link Performance
                  {totalLinkCount > 0 && (
                    <span className="ml-1.5 font-normal text-muted-foreground">({totalLinkCount})</span>
                  )}
                </h2>
                <Link
                  to="/dashboard/links"
                  className="shrink-0 text-xs font-medium text-foreground hover:underline"
                >
                  View all
                </Link>
              </div>
              {linksData.data?.links && linksData.data.links.length > 0 ? (
                <div className="mt-3">
                  {totalLinkCount > 5 && (
                    <div className="relative">
                      <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={linkSearch}
                        onChange={(e) => setLinkSearch(e.target.value)}
                        placeholder="Search links..."
                        className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  )}
                  {filteredLinks.length > 0 ? (
                    <>
                      <div className={`mt-3 space-y-2 ${showAllLinks ? "max-h-64 overflow-y-auto pr-1" : ""}`}>
                        {visibleLinks.map((link) => (
                          <div key={link.id} className="flex items-center justify-between gap-2 text-sm">
                            <div className="min-w-0 flex-1">
                              <span className="font-mono text-foreground">/{link.shortCode}</span>
                              {link.destinationUrl && (
                                <p className="truncate text-xs text-muted-foreground" title={link.destinationUrl}>
                                  {link.destinationUrl}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-muted-foreground">{link.clickCount}</span>
                              <Link
                                to={`/dashboard/analytics/${link.id}`}
                                className="text-xs font-medium text-foreground hover:underline"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                      {filteredLinks.length > 8 && (
                        <button
                          onClick={() => setShowAllLinks((v) => !v)}
                          className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          {showAllLinks ? "Show less" : `Show all ${filteredLinks.length} links`}
                        </button>
                      )}
                      {linksData.data?.pagination && totalLinkCount > allLinks.length && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                          Showing {allLinks.length} of {totalLinkCount}.{" "}
                          <Link to="/dashboard/links" className="font-medium text-foreground hover:underline">
                            Manage all in Links
                          </Link>
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      No links match &ldquo;{linkSearch}&rdquo;.
                    </p>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No links yet"
                  description="Create your first short link to see performance data."
                  action={
                    <Link
                      to="/dashboard/links"
                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Create Link
                    </Link>
                  }
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <p className="text-xs text-muted-foreground sm:text-sm">{title}</p>
      <p className="mt-1 text-lg font-bold text-foreground sm:text-2xl overflow-safe">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default Analytics;
