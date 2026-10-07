import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function VerifyEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendToken, setResendToken] = useState(null);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    setResendMessage("");
    setResendError("");
    setResendToken(null);
    try {
      const response = await resendVerification(resendEmail);
      setResendMessage(response.message);
      if (response.token) {
        setResendToken(response.token);
      }
    } catch (err) {
      setResendError(err.response?.data?.message || "Could not resend the email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

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
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-4 text-center sm:p-6">
        {status === "verifying" && (
          <div className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-muted-foreground">Verifying your email...</p>
          </div>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">Email Verified</h2>
            <p className="mt-2 text-sm text-muted-foreground overflow-safe">{message}</p>
            <Link
              to="/login"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">Verification Failed</h2>
            <p className="mt-2 text-sm text-muted-foreground overflow-safe">{message}</p>

            <form onSubmit={handleResend} className="mt-5 space-y-3 text-left" noValidate>
              <label htmlFor="resend-email" className="block text-sm font-medium text-foreground">
                Didn&apos;t get the email? Enter your address to resend the link
              </label>
              <input
                id="resend-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={resendEmail}
                onChange={(e) => {
                  setResendEmail(e.target.value);
                  setResendError("");
                  setResendMessage("");
                }}
                className="block h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="you@example.com"
              />
              {resendMessage && (
                <p className="rounded-md border border-green-200 bg-green-50 p-2 text-xs text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300 overflow-safe">
                  {resendMessage}
                </p>
              )}
              {resendError && (
                <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive-foreground overflow-safe">
                  {resendError}
                </p>
              )}
              <button
                type="submit"
                disabled={resendLoading}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {resendLoading ? "Sending..." : "Resend verification email"}
              </button>

              {resendToken && (
                <button
                  type="button"
                  onClick={() => {
                    verifyEmail(resendToken)
                      .then(() => {
                        setStatus("success");
                        setMessage("Email verified successfully! You can now log in.");
                      })
                      .catch((err) => {
                        setResendError(err.response?.data?.message || "Verification failed.");
                      });
                  }}
                  className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  Verify Account Now (1-Click)
                </button>
              )}
            </form>

            <Link
              to="/login"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
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
