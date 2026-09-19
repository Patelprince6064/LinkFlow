# Architecture Document

## 1. Overall Architecture

LinkHub is a monorepo MERN-stack application with a clear separation between the React frontend (`client/`) and Express backend (`server/`). The frontend communicates with the backend via a REST API, using Axios with cookie-based credentials.

```
Browser → React (Vite :5173) → REST API → Express (:5000) → MongoDB
```

## 2. Frontend Architecture

**Routing:** React Router v7 with a layout-based route hierarchy:
- `PublicLayout` — Landing page, login, register (unauthenticated)
- `DashboardLayout` — Authenticated user area (sidebar + header + content)

**State Management:** TanStack Query manages all server state (API data, caching, refetching). Local component state uses React hooks.

**UI Components:** Coss UI primitives (copy-paste component library built on Base UI + Tailwind CSS v4). Components live in `src/components/ui/` and are fully customizable.

**API Layer:** Centralized Axios instance at `src/services/api.js` with:
- Base URL pointing to backend `/api`
- `withCredentials: true` for cookie-based auth
- Request/response interceptors for token refresh and error handling

## 3. Backend Architecture

**Express Application:** Modular middleware stack:
1. Helmet (security headers)
2. CORS (origin-restricted, credentials-enabled)
3. JSON body parsing (10mb limit)
4. Cookie parsing
5. Rate limiting (100 req/15min on `/api`)
6. Route handlers
7. 404 handler
8. Global error handler

**Controller Pattern:** Async handlers wrapped in `asyncHandler()` to catch promise rejections without try/catch in every controller.

**Error Handling:** Custom `AppError` class with operational vs programmer error distinction. Production mode hides stack traces.

## 4. Database Architecture

**MongoDB + Mongoose:** Connection configured in `server/src/config/db.js` using `MONGODB_URI` env var. Mongoose handles schema validation, middleware, and query building.

**Planned Models (future phases):**
- `User` — Authentication, profile
- `Link` — Short links with vanity slugs
- `ClickEvent` — Individual click telemetry records
- `BioProfile` — Link-in-Bio page configuration

## 5. Authentication Approach (Phase 2)

- JWT-based authentication with access + refresh token pair
- Access token: short-lived (15min), sent via HTTP-only cookie
- Refresh token: long-lived (7d), sent via HTTP-only cookie
- Password hashing with bcrypt
- Token rotation on refresh to prevent reuse attacks
- Protected routes via auth middleware

## 6. URL Redirect Architecture (Phase 3)

```
GET /r/:shortCode → Express route → MongoDB lookup → HTTP 302 redirect
```

- Auto-generated 6-character alphanumeric short codes
- Custom vanity slugs with uniqueness validation
- Collision detection with retry logic
- Asynchronous click-event logging (non-blocking redirect response)

## 7. Analytics Architecture (Phase 4)

**Click Event Collection:**
- Captured asynchronously on each redirect (non-blocking)
- Metadata: timestamp, referrer, device type, IP hash (privacy-preserving)
- Stored in `ClickEvent` collection with references to `Link`

**Aggregation:**
- Pre-computed analytics using MongoDB aggregation pipelines
- Time-series click data for charts
- Top referrers, devices, and geographic breakdowns
- Cached aggregated results for dashboard performance

## 8. Link-in-Bio Architecture (Phase 5)

```
GET /bio/:username → Express route → Fetch BioProfile + Links → Render React page
```

- Public profile pages rendered server-side or via client-side routing
- BioProfile stores: display name, bio, avatar, theme, link ordering
- Links associated with user profile, supports drag-and-drop reordering
- Custom themes and styling options

## 9. Security Approach

| Layer | Implementation |
|-------|---------------|
| HTTP Headers | Helmet (CSP, HSTS, X-Frame-Options, etc.) |
| CORS | Origin-restricted to `CLIENT_URL`, credentials enabled |
| Rate Limiting | 100 req/15min on API, separate limits for auth and redirect |
| Body Parsing | 10mb limit to prevent payload attacks |
| Auth | JWT with HTTP-only, Secure, SameSite cookies |
| Passwords | bcrypt with salt rounds |
| Input Validation | Mongoose schema validation + middleware |
| Error Handling | No stack traces in production |

## 10. Scalability Considerations

- **Stateless backend:** JWT auth enables horizontal scaling behind a load balancer
- **Database indexing:** Short code, username, and link slug fields indexed for O(1) lookups
- **Async click logging:** Redirect response doesn't wait for analytics write
- **MongoDB Atlas:** Cloud database for production with replica sets and auto-scaling
- **CDN-ready frontend:** Vite produces optimized static bundles
- **Rate limiting:** Prevents abuse at the API gateway level
- **Separate concerns:** Services layer isolates business logic from controllers
