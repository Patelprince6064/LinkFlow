# API Documentation

## Base URL

```
Development: http://localhost:5000
Production: Set PUBLIC_BASE_URL environment variable
```

All endpoints are prefixed with `/api/v1` except health check (`/api/health`) and redirect (`/r/:shortCode`).

## Authentication

Authentication uses httpOnly cookies. JWT tokens are never exposed to JavaScript.

| Cookie | Duration | Description |
|--------|----------|-------------|
| `access_token` | 15 minutes | Short-lived access token |
| `refresh_token` | 7 days | Long-lived refresh token (rotated on use) |

---

## Health

### Health Check

```
GET /api/health
```

**Authentication:** None

**Success Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Authentication Endpoints

### Register

```
POST /api/v1/auth/register
```

**Authentication:** None

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1-80 characters |
| email | string | Yes | Valid email, max 254 characters |
| password | string | Yes | 8-128 characters |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isEmailVerified": false
    }
  }
}
```

**Note:** In development mode, the verification token is logged to the console. In production, an email service would be used.

**Error Responses:**
- `400` — Validation failed (missing fields, invalid email, short password)
- `409` — Email already registered

---

### Verify Email

```
POST /api/v1/auth/verify-email
```

**Authentication:** None

**Request Body:**
```json
{
  "token": "64-character-hex-string"
}
```

| Field | Type | Required |
|-------|------|----------|
| token | string | Yes |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isEmailVerified": true
    }
  }
}
```

**Error Responses:**
- `400` — Invalid or expired verification token

---

### Login

```
POST /api/v1/auth/login
```

**Authentication:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isEmailVerified": true
    }
  }
}
```

Sets `access_token` (15m) and `refresh_token` (7d) httpOnly cookies.

**Error Responses:**
- `400` — Missing email or password
- `401` — Invalid email or password
- `403` — Email not verified

---

### Refresh Token

```
POST /api/v1/auth/refresh
```

**Authentication:** Uses `refresh_token` cookie

**Success Response (200):**
```json
{
  "success": true,
  "message": "Session refreshed",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isEmailVerified": true
    }
  }
}
```

Rotates the refresh token (old token cannot be reused). Sets new `access_token` and `refresh_token` cookies.

**Error Responses:**
- `401` — Invalid, expired, or revoked refresh token

---

### Logout

```
POST /api/v1/auth/logout
```

**Authentication:** Required (`access_token` cookie)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

Clears both `access_token` and `refresh_token` cookies. Revokes the refresh token hash in the database.

---

### Get Current User

```
GET /api/v1/auth/me
```

**Authentication:** Required (`access_token` cookie)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isEmailVerified": true
    }
  }
}
```

**Error Responses:**
- `401` — Not authenticated or invalid token

---

### Forgot Password

```
POST /api/v1/auth/forgot-password
```

**Authentication:** None

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account exists for this email, password reset instructions have been generated."
}
```

**Note:** Always returns the same message regardless of whether the email exists (prevents account enumeration).

---

### Reset Password

```
POST /api/v1/auth/reset-password
```

**Authentication:** None

**Request Body:**
```json
{
  "token": "64-character-hex-string",
  "password": "newpassword123"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| token | string | Yes | Valid reset token |
| password | string | Yes | 8-128 characters |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. Please log in with your new password."
}
```

Invalidates all existing refresh tokens for the user.

**Error Responses:**
- `400` — Invalid or expired reset token, or validation failed

---

## Links Endpoints

All link endpoints require authentication.

### Create Link

```
POST /api/v1/links
```

**Authentication:** Required

**Request Body:**
```json
{
  "destinationUrl": "https://example.com",
  "customSlug": "my-link"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| destinationUrl | string | Yes | Valid HTTP/HTTPS URL, max 2048 chars |
| customSlug | string | No | 3-20 chars, alphanumeric + hyphens + underscores |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Short link created successfully",
  "data": {
    "link": {
      "id": "507f1f77bcf86cd799439011",
      "destinationUrl": "https://example.com",
      "shortCode": "aB3xYz",
      "shortUrl": "http://localhost:5000/r/aB3xYz",
      "clickCount": 0,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

If `customSlug` is not provided, a random 6-character code is generated.

**Error Responses:**
- `400` — Invalid URL, invalid slug format, reserved slug
- `409` — Slug already in use

---

### List Links

```
GET /api/v1/links
```

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 50) |
| search | string | — | Search by destination URL or short code |
| isActive | boolean | — | Filter by active status |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "links": [
      {
        "id": "507f1f77bcf86cd799439011",
        "destinationUrl": "https://example.com",
        "shortCode": "aB3xYz",
        "shortUrl": "http://localhost:5000/r/aB3xYz",
        "clickCount": 42,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### Get Single Link

```
GET /api/v1/links/:id
```

**Authentication:** Required (owner only)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId of the link |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "link": {
      "id": "507f1f77bcf86cd799439011",
      "destinationUrl": "https://example.com",
      "shortCode": "aB3xYz",
      "shortUrl": "http://localhost:5000/r/aB3xYz",
      "clickCount": 42,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` — Invalid link ID format
- `404` — Link not found or not owned by user

---

### Update Link

```
PATCH /api/v1/links/:id
```

**Authentication:** Required (owner only)

**Request Body (all fields optional):**
```json
{
  "destinationUrl": "https://new-url.com",
  "customSlug": "new-slug",
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Link updated successfully",
  "data": {
    "link": {
      "id": "507f1f77bcf86cd799439011",
      "destinationUrl": "https://new-url.com",
      "shortCode": "new-slug",
      "shortUrl": "http://localhost:5000/r/new-slug",
      "clickCount": 42,
      "isActive": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` — Invalid URL, invalid slug, reserved slug
- `404` — Link not found
- `409` — New slug already in use

---

### Delete Link

```
DELETE /api/v1/links/:id
```

**Authentication:** Required (owner only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Short link deleted successfully"
}
```

**Error Responses:**
- `400` — Invalid link ID format
- `404` — Link not found

---

## Redirect

### Redirect Short Link

```
GET /r/:shortCode
```

**Authentication:** None

**Behavior:**
1. Resolves the short code to a destination URL
2. Returns HTTP 302 redirect to the destination
3. Asynchronously records a ClickEvent with:
   - Referrer (or "Direct")
   - Device type (Mobile/Desktop/Tablet)
   - IP hash (SHA-256, raw IP never stored)
4. Atomically increments the link's clickCount

**Success Response:** HTTP 302 with `Location` header

**Error Responses:**
- `404` — Short code not found or link inactive
- `429` — Rate limit exceeded (60 requests per minute)

**Note:** Telemetry failures do not prevent the redirect. If click recording fails, the redirect still succeeds.

---

## Analytics Endpoints

All analytics endpoints require authentication.

### Overview

```
GET /api/v1/analytics/overview
```

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startDate | string | 7 days ago | ISO date string (YYYY-MM-DD) |
| endDate | string | today | ISO date string (YYYY-MM-DD) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalClicks": 1234,
    "totalLinks": 15,
    "activeLinks": 12,
    "topLink": {
      "id": "507f1f77bcf86cd799439011",
      "shortCode": "abc123",
      "clicks": 456
    }
  }
}
```

**Error Responses:**
- `400` — Date range exceeds 90 days

---

### Clicks Over Time

```
GET /api/v1/analytics/clicks-over-time
```

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startDate | string | 7 days ago | ISO date string |
| endDate | string | today | ISO date string |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "date": "2024-01-01", "clicks": 10 },
    { "date": "2024-01-02", "clicks": 0 },
    { "date": "2024-01-03", "clicks": 25 }
  ]
}
```

Missing days are zero-filled.

---

### Top Referrers

```
GET /api/v1/analytics/referrers
```

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startDate | string | 7 days ago | ISO date string |
| endDate | string | today | ISO date string |
| limit | number | 10 | Max results (1-50) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "referrer": "https://google.com", "clicks": 450 },
    { "referrer": "Direct", "clicks": 230 },
    { "referrer": "https://instagram.com", "clicks": 120 }
  ]
}
```

---

### Device Distribution

```
GET /api/v1/analytics/devices
```

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startDate | string | 7 days ago | ISO date string |
| endDate | string | today | ISO date string |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "deviceType": "Mobile", "clicks": 600, "percentage": 50 },
    { "deviceType": "Desktop", "clicks": 480, "percentage": 40 },
    { "deviceType": "Tablet", "clicks": 120, "percentage": 10 }
  ]
}
```

---

### Per-Link Analytics

```
GET /api/v1/analytics/links/:linkId
```

**Authentication:** Required (owner only)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| linkId | string | MongoDB ObjectId of the link |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startDate | string | 7 days ago | ISO date string |
| endDate | string | today | ISO date string |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "link": {
      "id": "507f1f77bcf86cd799439011",
      "shortCode": "abc123",
      "destinationUrl": "https://example.com"
    },
    "totalClicks": 456,
    "clicksOverTime": [
      { "date": "2024-01-01", "clicks": 10 },
      { "date": "2024-01-02", "clicks": 0 }
    ],
    "referrers": [
      { "referrer": "https://google.com", "clicks": 200 },
      { "referrer": "Direct", "clicks": 150 }
    ],
    "devices": [
      { "deviceType": "Mobile", "clicks": 250, "percentage": 55 },
      { "deviceType": "Desktop", "clicks": 180, "percentage": 39 },
      { "deviceType": "Tablet", "clicks": 26, "percentage": 6 }
    ]
  }
}
```

**Error Responses:**
- `404` — Link not found or not owned by user

---

## Bio Endpoints

### Get My Bio

```
GET /api/v1/bio/me
```

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg",
    "displayName": "John Doe",
    "bio": "Software developer",
    "theme": "Minimal Light",
    "socialLinks": [
      { "platform": "GitHub", "url": "https://github.com/johndoe", "order": 0 },
      { "platform": "LinkedIn", "url": "https://linkedin.com/in/johndoe", "order": 1 }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** Returns `null` data if no profile exists.

---

### Create Bio

```
POST /api/v1/bio
```

**Authentication:** Required

**Request Body:**
```json
{
  "username": "johndoe",
  "displayName": "John Doe",
  "bio": "Software developer and tech enthusiast",
  "avatar": "https://example.com/avatar.jpg",
  "theme": "Dark Slate",
  "socialLinks": [
    { "platform": "GitHub", "url": "https://github.com/johndoe", "order": 0 },
    { "platform": "LinkedIn", "url": "https://linkedin.com/in/johndoe", "order": 1 }
  ]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| username | string | Yes | 3-30 chars, alphanumeric + hyphens + underscores, lowercase |
| displayName | string | Yes | 1-80 characters |
| bio | string | No | Max 300 characters |
| avatar | string | No | Max 500 characters (URL) |
| theme | string | No | One of: "Minimal Light", "Dark Slate", "Gradient" |
| socialLinks | array | No | Max 10 items |

**Allowed platforms:** Instagram, LinkedIn, GitHub, YouTube, Twitter/X, Website (free-form string)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Bio profile created",
  "data": { ... }
}
```

**Error Responses:**
- `400` — Validation failed (invalid username, theme, or social link URLs)
- `409` — Username already taken or profile already exists

---

### Update Bio

```
PATCH /api/v1/bio
```

**Authentication:** Required

**Request Body (all fields optional):**
```json
{
  "displayName": "John D.",
  "bio": "Updated bio",
  "theme": "Gradient"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bio profile updated",
  "data": { ... }
}
```

**Error Responses:**
- `400` — Validation failed
- `404` — No profile exists (create one first)
- `409` — Username already taken

---

### Delete Bio

```
DELETE /api/v1/bio
```

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bio profile deleted"
}
```

**Error Responses:**
- `404` — No profile exists

---

### Public Bio

```
GET /api/v1/bio/:username
```

**Authentication:** None (public)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| username | string | Bio username |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg",
    "displayName": "John Doe",
    "bio": "Software developer",
    "theme": "Minimal Light",
    "socialLinks": [
      { "platform": "GitHub", "url": "https://github.com/johndoe", "order": 0 }
    ]
  }
}
```

**Note:** Only public fields are returned. No email, password, user ID, or internal data is exposed.

**Error Responses:**
- `404` — Profile not found

---

## Rate Limits

| Route | Limit | Window |
|-------|-------|--------|
| `/api/*` | 100 requests | 15 minutes |
| `/api/v1/auth/*` | 20 requests | 15 minutes |
| `/r/*` | 60 requests | 1 minute |
| `/api/v1/bio/*` | 30 requests | 5 minutes |

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["field-specific error 1", "field-specific error 2"]
}
```

The `errors` array is only present for validation errors.

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Forbidden (e.g., unverified email) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email/slug) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
