# Authentication Architecture

## Overview

JWT-based authentication using httpOnly cookies with access/refresh token pair and automatic token rotation.

## Token Strategy

### Access Token
- **Lifetime:** 15 minutes
- **Storage:** httpOnly cookie (`access_token`)
- **Payload:** `{ sub: userId, role, type: "access" }`
- **Purpose:** Authenticate API requests

### Refresh Token
- **Lifetime:** 7 days
- **Storage:** httpOnly cookie (`refresh_token`)
- **Payload:** `{ sub: userId, type: "refresh", jti: uniqueId }`
- **Purpose:** Obtain new access tokens without re-login

## Cookie Configuration

| Setting | Development | Production |
|---------|-------------|------------|
| httpOnly | true | true |
| secure | false | true |
| sameSite | lax | strict |
| path | / | / |

## Authentication Flow

### Registration
```
Browser → POST /api/v1/auth/register
  → Validate input
  → Hash password (bcrypt)
  → Generate verification token
  → Store token hash in User document
  → Log verification URL (development)
  → Return success message
```

### Email Verification
```
Browser → GET /verify-email?token=...
  → POST /api/v1/auth/verify-email { token }
  → Hash token, find matching User
  → Set isEmailVerified = true
  → Clear verification token
```

### Login
```
Browser → POST /api/v1/auth/login
  → Find user by email
  → Compare password (bcrypt)
  → Check isEmailVerified
  → Generate access token (15min)
  → Generate refresh token (7 days, unique jti)
  → Hash refresh token, store in User
  → Set httpOnly cookies
  → Return safe user data
```

### Token Refresh (Automatic)
```
API request → 401 (expired access)
  → POST /api/v1/auth/refresh
  → Read refresh token from cookie
  → Verify JWT signature
  → Find user, compare token hash
  → Generate new access + refresh tokens
  → Replace stored hash (rotation)
  → Set new cookies
  → Retry original request
```

### Logout
```
Browser → POST /api/v1/auth/logout
  → Clear refreshTokenHash from User
  → Clear both cookies
```

## Refresh Token Rotation

When a refresh token is used:
1. The old token's hash is removed from the database
2. A new refresh token with a new `jti` is issued
3. The new token's hash is stored
4. The old token becomes permanently invalid

**Replay protection:** If a revoked token is presented, all sessions for that user are cleared.

## Password Security

- Passwords hashed with bcrypt (12 salt rounds)
- Minimum 8 characters required
- `passwordHash` field has `select: false` — never returned in queries
- Password reset invalidates all existing refresh tokens

## Token Hashing

All persistent tokens (verification, reset, refresh) are stored as bcrypt hashes:
- `emailVerificationTokenHash`
- `passwordResetTokenHash`
- `refreshTokenHash`

Raw tokens are only ever:
- Logged to console in development (verification, reset)
- Sent in httpOnly cookies (refresh)

## Route Protection

### requireAuth Middleware
1. Reads access token from cookie
2. Verifies JWT signature
3. Checks token type is "access"
4. Loads user from database
5. Attaches safe user data to `req.user`

### requireRole Middleware
- Accepts allowed roles as arguments
- Returns 403 if user role not in allowed list
- Usage: `requireAuth, requireRole("admin")`

## Rate Limiting

Authentication endpoints are rate-limited:
- Window: 15 minutes
- Max requests: 20 per window
- Applied to: register, login, forgot-password, reset-password, refresh

## Security Checklist

- [x] No plaintext passwords stored
- [x] No JWT in localStorage/sessionStorage
- [x] No raw tokens in database
- [x] httpOnly cookies prevent JavaScript access
- [x] secure flag in production
- [x] SameSite protection
- [x] CORS restricted to CLIENT_URL
- [x] Generic forgot-password response (prevents enumeration)
- [x] Token expiration enforced
- [x] Refresh rotation on every use
- [x] Logout clears cookies and database
- [x] Password reset clears all sessions
- [x] Safe user data only in responses

## CSRF Considerations

- SameSite=strict in production blocks cross-origin cookie sending
- SameSite=lax in development allows top-level navigation
- CORS origin restriction prevents unauthorized cross-origin requests
- No custom CSRF middleware needed with this architecture

## Environment Variables

```
JWT_ACCESS_SECRET=<random 48-byte hex>
JWT_REFRESH_SECRET=<random 48-byte hex>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```
