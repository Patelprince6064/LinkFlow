import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAnalyticsOverview, useClicksOverTime, useTopReferrers, useDeviceDistribution } from "../hooks/useAnalytics";
import { useLinks } from "../hooks/useLinks";

const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
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
  const { startDate, endDate } = useMemo(() => getDateRange(datePreset), [datePreset]);

  const overview = useAnalyticsOverview({ startDate, endDate });
  const clicksOverTime = useClicksOverTime({ startDate, endDate });
  const referrers = useTopReferrers({ startDate, endDate, limit: 8 });
  const devices = useDeviceDistribution({ startDate, endDate });
  const linksData = useLinks({ page: 1, limit: 50 });

  const isLoading = overview.isLoading || clicksOverTime.isLoading || referrers.isLoading || devices.isLoading;

  const refreshAll = () => {
    overview.refetch();
    clicksOverTime.refetch();
    referrers.refetch();
    devices.refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track how your short links are performing.
          </p>
        </div>
        <button
          onClick={refreshAll}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.days}
            onClick={() => setDatePreset(preset.days)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              datePreset === preset.days
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground hover:bg-accent"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Clicks" value={overview.data?.totalClicks ?? 0} />
            <StatCard title="Total Links" value={overview.data?.totalLinks ?? 0} />
            <StatCard title="Active Links" value={overview.data?.activeLinks ?? 0} />
            <StatCard
              title="Top Link"
              value={overview.data?.topLink ? `/${overview.data.topLink.shortCode}` : "—"}
              subtitle={overview.data?.topLink ? `${overview.data.topLink.clicks} clicks` : "No clicks yet"}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
              <h2 className="text-sm font-medium text-foreground">Clicks Over Time</h2>
              {clicksOverTime.data && clicksOverTime.data.length > 0 ? (
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={clicksOverTime.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                      />
                      <Line type="monotone" dataKey="clicks" stroke="var(--primary)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No click data yet.</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Device Distribution</h2>
              {devices.data && devices.data.some((d) => d.clicks > 0) ? (
                <div className="mt-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={devices.data.filter((d) => d.clicks > 0)}
                          dataKey="clicks"
                          nameKey="deviceType"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={35}
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
                <p className="mt-4 text-sm text-muted-foreground">No device data yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Top Referrers</h2>
              {referrers.data && referrers.data.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {referrers.data.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[200px] text-foreground">{r.referrer}</span>
                      <span className="text-muted-foreground">{r.clicks}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No referrer data yet.</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Link Performance</h2>
              {linksData.data?.links && linksData.data.links.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {linksData.data.links.slice(0, 8).map((link) => (
                    <div key={link.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">/{link.shortCode}</span>
                        <span className="truncate max-w-[150px] text-muted-foreground">{link.destinationUrl}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{link.clickCount} clicks</span>
                        <Link
                          to={`/dashboard/analytics/${link.id}`}
                          className="text-xs text-foreground hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No links yet.</p>
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
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default Analytics;
