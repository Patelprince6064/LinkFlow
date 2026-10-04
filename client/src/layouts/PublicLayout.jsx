import { Outlet, Link } from "react-router-dom";
import { Link2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function PublicLayout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md safe-top">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              LinkHub
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <a
              href="/#features"
              className="hidden px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className="hidden px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              How it works
            </a>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors sm:px-4"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors sm:px-4"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-muted/30 py-10 safe-bottom sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Link2 className="h-4 w-4" />
                </span>
                <span className="text-base font-bold text-foreground">LinkHub</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                Branded short links, QR codes, bio pages, and click analytics — in one hub.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="/#features" className="hover:text-foreground">Features</a></li>
                <li><a href="/#how-it-works" className="hover:text-foreground">How it works</a></li>
                <li><Link to="/register" className="hover:text-foreground">Get started</Link></li>
                <li><Link to="/login" className="hover:text-foreground">Log in</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Resources</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link to="/forgot-password" className="hover:text-foreground">Reset password</Link></li>
                <li><Link to="/verify-email" className="hover:text-foreground">Verify email</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-center text-xs text-muted-foreground sm:text-sm">
              &copy; {new Date().getFullYear()} LinkHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
