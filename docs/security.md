# Security Documentation

## 1. Authentication

- JWT-based authentication with access and refresh tokens
- Access token: 15-minute expiry, httpOnly cookie
- Refresh token: 7-day expiry, httpOnly cookie, rotated on each use
- Password hashing with bcryptjs
- Email verification required before login
- Password reset invalidates existing sessions

## 2. JWT Security

- Access tokens signed with `JWT_ACCESS_SECRET`
- Refresh tokens signed with `JWT_REFRESH_SECRET`
- Token type checking (`access` vs `refresh`)
- Subject/user ID embedded in token
- Refresh token rotation: each refresh issues new token pair
- Old refresh tokens invalidated on rotation

## 3. Cookie Security

- `httpOnly: true` — prevents JavaScript access
- `secure: true` in production — HTTPS only
- `sameSite: "strict"` in production — CSRF protection
- `sameSite: "lax"` in development — localhost compatibility
- `path: "/"` — consistent cookie scope
- `maxAge` set for both token types

## 4. CORS

- Origin restricted to `CLIENT_URL` environment variable
- Credentials enabled only for trusted frontend
- Methods limited to GET, POST, PUT, DELETE, PATCH
- Headers limited to Content-Type, Authorization

## 5. Rate Limiting

| Endpoint | Window | Max Requests | Purpose |
|----------|--------|-------------|---------|
| `/api/*` | 15 min | 100 | General API |
| `/api/v1/auth/*` | 15 min | 20 | Auth brute-force |
| `/r/:shortCode` | 1 min | 60 | Redirect abuse |
| `/api/v1/bio/*` | 5 min | 30 | Bio endpoint abuse |

## 6. Input Validation

### Validation Middleware

All endpoints validated via `validateBody()` middleware:
- Type checking (string, number, boolean, array)
- Required field enforcement
- Min/max length bounds
- Pattern matching (regex)
- Custom validators

### URL Validation

- Only `http://` and `https://` protocols allowed
- `javascript:`, `data:`, `file:`, `vbscript:` rejected
- Applied to destination URLs, avatar URLs, social link URLs

### Slug Validation

- 3-20 characters
- Only letters, numbers, hyphens, underscores
- Reserved slugs blocked (api, login, dashboard, etc.)
- Path traversal patterns rejected

### Search Input Sanitization

- Regex special characters escaped to prevent ReDoS
- Maximum 100 characters
- Empty/invalid input returns null

## 7. XSS Protection

- React escapes all rendered content by default
- No `dangerouslySetInnerHTML` used for user content
- Bio content rendered as text, not HTML
- External links use `target="_blank" rel="noopener noreferrer"`

## 8. MongoDB Query Safety

- All queries use explicit field filters
- User ownership always enforced via `user: req.user.id`
- No `Model.find(req.query)` patterns
- Regex queries use sanitized input
- No `$where`, `$regex` (raw), or operator injection possible

## 9. Ownership Enforcement

Every authenticated resource query includes user ID:
- Links: `{ _id: linkId, user: userId }`
- Bio: `{ user: userId }`
- Analytics: scoped via `getUserLinkIds(userId)`

User A cannot access User B's resources. Missing resources return 404 (not 403).

## 10. IP Privacy

- Raw IP addresses never stored
- Only SHA-256 hashed IP stored in ClickEvent
- Analytics API never returns `ipHash`
- Hash is one-way, irreversible

## 11. Error Handling

- Centralized error handler catches all errors
- Mongoose ValidationError → 400 with field errors
- CastError (invalid ObjectId) → 400 "Invalid ID format"
- Duplicate key (code 11000) → 409 "Resource already exists"
- Production: generic error messages only
- Development: stack traces logged server-side

## 12. Logging

- Structured JSON logging
- Request method, URL, status, duration
- Errors logged with context
- Passwords, tokens, IPs never logged
- Sensitive values redacted in logs

## 13. Environment Security

- `.env` file not committed to git
- `.env.example` contains placeholders only
- Production requires: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Startup fails fast if required variables missing
- Secrets never exposed in API responses

## 14. Redirect Security

- Destination URL comes from MongoDB only
- Never accepts client-provided destination
- `GET /r/:shortCode` resolves from Link model
- Disabled links return 404
- Click telemetry recorded asynchronously

## 15. Bio Security

- Public endpoint returns only: username, avatar, displayName, bio, theme, socialLinks
- No email, password, token, or userId exposed
- Username lookup indexed for performance
- Reserved usernames protected

## 16. Mass Assignment Protection

- Controllers whitelist allowed fields
- `req.body` never passed directly to model operations
- Link update: only `destinationUrl`, `customSlug`, `isActive` allowed
- Bio update: only profile fields allowed
- `user`, `clickCount`, `createdAt` never client-settable

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| Account takeover | bcrypt passwords, email verification, JWT rotation |
| Token theft | httpOnly cookies, secure in production, short-lived access tokens |
| Brute-force login | Rate limiting (20/15min on auth endpoints) |
| Open redirect | Destination from MongoDB only, never client-provided |
| XSS | React auto-escaping, no dangerouslySetInnerHTML |
| NoSQL injection | Explicit field queries, no req.query merging |
| Cross-user data access | Ownership filters on every query |
| ReDoS | Search input sanitized, regex escaped |
| Path traversal | Slug validation rejects `../` patterns |
| Malicious URLs | Protocol validation (http/https only) |

## Known Limitations

- CSRF not fully solved by CORS alone; SameSite cookies provide primary protection
- No IP-based rate limiting (relies on cookie-based auth)
- Email verification is simulated (not actual email delivery)
- No Content Security Policy headers configured (Helmet defaults used)
