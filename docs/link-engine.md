# Link Engine Architecture

## Overview

Short-link management engine providing CRUD operations for URL shortening with custom vanity slugs.

## Short-Code Generation

- **Length:** Exactly 6 characters
- **Alphabet:** `A-Z a-z 0-9` (62 characters)
- **Generator:** `crypto.randomBytes()` — cryptographically secure
- **Space:** 62^6 = ~56.8 billion possible codes
- **NOT using:** `Math.random()`

## Collision Handling

1. Generate 6-character code
2. Query `Link` collection for existing match
3. If unique → use it
4. If collision → regenerate (up to 10 retries)
5. If all retries fail → return 500 error
6. MongoDB unique index on `shortCode` is the final safety net

## Custom Vanity Slugs

- **Length:** 3-20 characters
- **Allowed:** `a-z A-Z 0-9 - _`
- **Reserved:** api, login, register, dashboard, admin, r, bio, auth, etc.
- **Collision:** Returns 409 Conflict with clear message
- **On collision:** Does NOT auto-generate alternative — user must choose another

## URL Validation

- **Allowed:** `http://` and `https://`
- **Blocked:** `javascript:`, `data:`, `file:`, `vbscript:`
- **Method:** `new URL()` constructor with protocol check
- **Normalization:** None — preserves user's original URL

## Database Indexes

| Index | Purpose |
|-------|---------|
| `{ shortCode: 1 }` (unique) | Fast redirect lookup |
| `{ user: 1, createdAt: -1 }` | User's link library |

## Link Ownership

- Every link has a `user` field (ObjectId → User)
- All queries scope by `req.user.id`
- Cross-user access returns 404 (not 403) to prevent enumeration
- Ownership is enforced at the service layer

## API Endpoints

### POST /api/v1/links
**Auth:** Required
**Body:**
```json
{
  "destinationUrl": "https://example.com",
  "customSlug": "optional-slug"
}
```
**Response:** 201 with created link

### GET /api/v1/links
**Auth:** Required
**Query:** `page`, `limit`, `search`, `isActive`
**Response:** Paginated links array

### GET /api/v1/links/:id
**Auth:** Required
**Response:** Single link

### PATCH /api/v1/links/:id
**Auth:** Required
**Body:** `destinationUrl`, `customSlug`, `isActive`
**Response:** Updated link

### DELETE /api/v1/links/:id
**Auth:** Required
**Response:** Success message

## Pagination

- **Default page:** 1
- **Default limit:** 10
- **Max limit:** 50
- **Sort:** Newest first (`createdAt: -1`)

## Search

- **Fields:** `destinationUrl`, `shortCode`
- **Method:** Case-insensitive regex
- **Scope:** Only authenticated user's links
- **Tradeoff:** Regex search is simple but may be slow on very large datasets. For this scale, it's acceptable.

## Short URL Format

```
{PUBLIC_BASE_URL}/r/{shortCode}
```

Example: `http://localhost:5000/r/a8K2xP`

## Security

- All endpoints require authentication
- Ownership enforced on every query
- URL protocol validation
- Slug character validation
- Reserved slug protection
- Pagination limit enforced
- No raw database errors exposed
