export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center sm:p-12">
      {icon && <div className="mx-auto mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground overflow-safe">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-accent ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-2 h-6 w-16 sm:h-7" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-48 w-full sm:h-64" />
    </div>
  );
}
