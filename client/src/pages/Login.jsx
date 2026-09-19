import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Log in to LinkHub</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </div>
      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground text-center">
          Authentication will be implemented in Phase 2.
        </p>
      </div>
    </div>
  );
}

export default Login;
