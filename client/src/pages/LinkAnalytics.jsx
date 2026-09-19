import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLinkAnalytics } from "../hooks/useAnalytics";
import { StatCardSkeleton, EmptyState } from "../components/common/UIComponents";

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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            &larr; Analytics
          </Link>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-accent" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (analytics.isError) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Analytics
        </Link>
        <EmptyState
          title="Link not found"
          description="The link you're looking for doesn't exist or has been deleted."
          action={
            <Link
              to="/dashboard/analytics"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to Analytics
            </Link>
          }
        />
      </div>
    );
  }

  const data = analytics.data;

  return (
    <div>
      <Link to="/dashboard/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        &larr; Analytics
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground font-mono">/{data.link.shortCode}</h1>
          <p className="mt-1 text-sm text-muted-foreground truncate max-w-md">{data.link.destinationUrl}</p>
        </div>
        <div className="flex gap-1">
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
          <EmptyState
            title="No click data yet"
            description="Share this short link to start collecting analytics."
          />
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
            <EmptyState
              title="No device data yet"
              description="Device info appears after this link receives clicks."
            />
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
            <EmptyState
              title="No referrer data yet"
              description="Referrer info appears when people click from other sites."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default LinkAnalytics;
