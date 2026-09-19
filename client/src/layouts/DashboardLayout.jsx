import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <a href="/dashboard" className="text-lg font-bold text-foreground">
            LinkHub
          </a>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <a
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Dashboard
          </a>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log out
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
