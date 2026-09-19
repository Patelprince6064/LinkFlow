import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLinkAnalytics } from "../hooks/useAnalytics";

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

function LinkAnalytics() {
  const { linkId } = useParams();
  const [datePreset, setDatePreset] = useState(7);
  const { startDate, endDate } = useMemo(() => getDateRange(datePreset), [datePreset]);

  const analytics = useLinkAnalytics(linkId, { startDate, endDate });

  if (analytics.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-accent" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
      </div>
    );
  }

  if (analytics.isError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Link not found.</p>
        <Link to="/dashboard/analytics" className="mt-2 inline-block text-sm text-foreground hover:underline">
          Back to Analytics
        </Link>
      </div>
    );
  }

  const data = analytics.data;

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link to="/dashboard/analytics" className="text-muted-foreground hover:text-foreground text-sm">
          ← Analytics
        </Link>
      </div>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-mono">/{data.link.shortCode}</h1>
          <p className="mt-1 text-sm text-muted-foreground truncate max-w-md">{data.link.destinationUrl}</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setDatePreset(days)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                datePreset === days
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:bg-accent"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Clicks</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{data.totalClicks}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unique Referrers</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{data.referrers.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Short Code</p>
          <p className="mt-1 text-2xl font-bold text-foreground font-mono">/{data.link.shortCode}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium text-foreground">Clicks Over Time</h2>
        {data.clicksOverTime.some((d) => d.clicks > 0) ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.clicksOverTime}>
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground">Device Distribution</h2>
          {data.devices.some((d) => d.clicks > 0) ? (
            <div className="mt-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.devices.filter((d) => d.clicks > 0)}
                      dataKey="clicks"
                      nameKey="deviceType"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={35}
                    >
                      {data.devices
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
                {data.devices.map((d) => (
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

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground">Top Referrers</h2>
          {data.referrers.length > 0 ? (
            <div className="mt-4 space-y-2">
              {data.referrers.map((r, i) => (
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
      </div>
    </div>
  );
}

export default LinkAnalytics;
