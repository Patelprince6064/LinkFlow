export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="rounded-lg border border-border bg-card p-12 text-center">
      {icon && <div className="mx-auto mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-accent ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-2 h-7 w-16" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-64 w-full" />
    </div>
  );
}
