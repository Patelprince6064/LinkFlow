import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Invalid or expired verification token.");
      });
  }, [searchParams, verifyEmail]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        {status === "verifying" && (
          <>
            <p className="text-sm text-muted-foreground">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <h2 className="text-lg font-bold text-foreground">Email Verified</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link
              to="/login"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-lg font-bold text-foreground">Verification Failed</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link
              to="/login"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
