const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderPasswordGateHtml = (shortCode, isIncorrect = false) => {
  const safeCode = escapeHtml(shortCode);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Required — LinkHub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #09090b;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 1rem;
      padding: 2.25rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      color: #fff;
      font-size: 24px;
    }
    h1 { font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    p.subtitle { color: #a1a1aa; font-size: 0.9rem; line-height: 1.4; margin-bottom: 1.5rem; }
    .error-msg {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    label { display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.5rem; color: #d4d4d8; }
    input[type="password"] {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #09090b;
      border: 1px solid #3f3f46;
      border-radius: 0.5rem;
      color: #fafafa;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input[type="password"]:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25);
    }
    button {
      margin-top: 1.25rem;
      width: 100%;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.05s;
    }
    button:hover { opacity: 0.92; }
    button:active { transform: scale(0.99); }
    .footer { margin-top: 1.75rem; text-align: center; font-size: 0.75rem; color: #71717a; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-badge">🔒</div>
    <h1>Protected Short Link</h1>
    <p class="subtitle">This link is password-protected. Enter the password below to continue.</p>
    ${isIncorrect ? '<div class="error-msg">Incorrect password. Please try again.</div>' : ""}
    <form method="GET" action="/r/${safeCode}">
      <label for="pwd">Password</label>
      <input type="password" id="pwd" name="p" placeholder="Enter link password" autofocus required />
      <button type="submit">Unlock & Continue &rarr;</button>
    </form>
    <div class="footer">Secured by LinkHub</div>
  </div>
</body>
</html>`;
};

export const renderExpiredHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Link Expired — LinkHub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #09090b;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 1rem;
      padding: 2.25rem;
      width: 100%;
      max-width: 420px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon { font-size: 40px; margin-bottom: 1rem; }
    h1 { font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem; }
    p { color: #a1a1aa; font-size: 0.9rem; line-height: 1.5; }
    .footer { margin-top: 1.75rem; font-size: 0.75rem; color: #71717a; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⌛</div>
    <h1>This Link Has Expired</h1>
    <p>The short link you are trying to visit has passed its expiration date and is no longer accessible.</p>
    <div class="footer">LinkHub</div>
  </div>
</body>
</html>`;
