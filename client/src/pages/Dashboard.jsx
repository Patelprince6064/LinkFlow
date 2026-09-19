import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome back, {user?.name || "User"}.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-medium text-foreground">Account Details</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-foreground">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-foreground">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd className="text-foreground capitalize">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email Verified</dt>
            <dd className="text-foreground">{user?.isEmailVerified ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
      >
        Log out
      </button>
    </div>
  );
}

export default Dashboard;
