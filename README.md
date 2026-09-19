# Branded Short-Link & Bio-Link Hub

A full-stack MERN application combining branded URL shortening, click analytics, QR code generation, and customizable Link-in-Bio profiles.

## Problem Statement

Users need a simple way to create branded short URLs, track engagement through analytics, generate QR codes for offline sharing, and maintain a centralized public profile containing their important links — all in one application.

## Features

### Authentication
- User registration with email verification simulation
- Login with JWT access tokens (15-minute expiry)
- Refresh token rotation (7-day expiry) in httpOnly cookies
- Forgot password and reset flow
- Secure cookie-based session management

### URL Shortening
- Automatic 6-character alphanumeric short codes
- Custom vanity slugs (3-20 characters)
- Collision detection with retry logic
- URL validation (HTTP/HTTPS only)
- Reserved slug protection
- Link management (create, edit, deactivate, delete)
- Search and pagination

### Click Analytics
- Real-time click telemetry on every redirect
- Click timeline with zero-filled daily data
- Top referrers (grouped by source)
- Device distribution (Mobile/Desktop/Tablet)
- Per-link analytics with date range filtering
- Overview dashboard with totals

### QR Codes
- Client-side QR generation using qrcode.react
- QR encodes the short link URL (not destination)
- PNG download with descriptive filename
- QR scans automatically tracked in analytics

### Link-in-Bio
- Profile builder with avatar, display name, and bio
- Social links management (add, edit, reorder, delete)
- 3 themes: Minimal Light, Dark Slate, Gradient
- Public profile at `/bio/:username`
- Responsive mobile-first design

### Security
- Rate limiting on all routes (API, auth, redirect, bio)
- bcrypt password hashing (12 salt rounds)
- Input validation on all endpoints
- URL validation blocking javascript:/data:/file: protocols
- IP address hashing (SHA-256, raw IP never stored)
- Ownership enforcement on all resources
- Helmet HTTP security headers
- CORS with credentials
- Search input sanitization (ReDoS prevention)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, React Router v7, TanStack Query |
| UI Components | Coss UI (shadcn-style on Base UI + Tailwind CSS v4) |
| Charts | Recharts |
| QR Generation | qrcode.react |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose 8 |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| Security | Helmet, CORS, express-rate-limit, httpOnly cookies |

## Architecture

```
User
  |
  v
React Frontend (Vite)
  |
  v
REST API (Express.js)
  |
  +-- Middleware (auth, validation, rate-limiting, error handling)
  |
  +-- Controllers (request/response handling)
  |
  +-- Services (business logic)
  |
  +-- Models (Mongoose schemas)
  |
  v
MongoDB
```

### Authentication Flow
1. Register creates user with hashed password and verification token
2. Email verification sets `isEmailVerified: true`
3. Login validates credentials, sets access + refresh cookies
4. Protected routes check `access_token` cookie via `requireAuth` middleware
5. On 401, frontend attempts refresh via `refresh_token` cookie
6. Refresh rotates both tokens (old refresh token invalidated)

### Short-Link Redirect Flow
1. `GET /r/:shortCode` hits Express
2. Service resolves shortCode to destination URL via indexed lookup
3. Express returns HTTP 302 redirect
4. Click telemetry recorded asynchronously (referrer, device, IP hash)
5. Link's `clickCount` incremented atomically

### Analytics Flow
1. Frontend requests overview/timeline/referrers/devices
2. Service builds date range and fetches user's link IDs
3. MongoDB aggregation pipelines process ClickEvent data
4. Results zero-filled for missing days
5. Response returned to Recharts for visualization

### Bio Flow
1. User creates profile via Bio Editor
2. Username validated (3-30 chars, alphanumeric, not reserved)
3. Social links validated (valid HTTP/HTTPS URLs)
4. Public profile served at `/bio/:username` without authentication
5. Only public fields returned (no email, no user ID)

## Database Design

```
User
  |-- email (unique index)
  |-- passwordHash
  |-- refreshTokenHash
  |-- emailVerificationTokenHash
  |-- passwordResetTokenHash
  |
  +-- Link (user reference, indexed)
  |     |-- shortCode (unique index)
  |     |-- destinationUrl
  |     |-- clickCount
  |     |-- isActive
  |     |
  |     +-- ClickEvent (link reference, indexed)
  |           |-- timestamp
  |           |-- referrer
  |           |-- deviceType
  |           |-- ipHash
  |
  +-- BioProfile (user reference, unique)
        |-- username (unique index)
        |-- displayName
        |-- bio
        |-- theme
        |-- socialLinks[]
```

### Indexes
- `User.email` — unique, for login lookup
- `Link.shortCode` — unique, for redirect resolution
- `Link.user + createdAt` — for user's link list sorted by date
- `ClickEvent.link + timestamp` — for per-link analytics
- `ClickEvent.timestamp` — for time-range queries
- `BioProfile.username` — unique, for public profile lookup
- `BioProfile.user` — unique, one profile per user

## Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# Clone the repository
git clone https://github.com/Patelprince6064/LinkFlow.git
cd short-link-bio-hub

# Install dependencies
cd server && npm install
cd ../client && npm install
cd ..

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
```

### Environment Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `NODE_ENV` | Environment | `development` | `production` |
| `PORT` | Server port | `5000` | `5000` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/linkflow` | `mongodb+srv://...` |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` | `https://your-app.vercel.app` |
| `PUBLIC_BASE_URL` | Backend public URL | `http://localhost:5000` | `https://your-api.onrender.com` |
| `JWT_ACCESS_SECRET` | Access token secret | random string | random 64+ chars |
| `JWT_REFRESH_SECRET` | Refresh token secret | different string | different 64+ chars |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token TTL | `15m` | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token TTL | `7d` | `7d` |
| `COOKIE_SECURE` | Secure cookies | `false` | `true` |
| `COOKIE_SAME_SITE` | SameSite policy | `lax` | `none` |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Running

```bash
# Start both frontend and backend
npm run dev

# Or start individually
cd server && npm run dev    # Backend: http://localhost:5000
cd client && npm run dev    # Frontend: http://localhost:5173
```

### Seed Data (Optional)

```bash
cd server && npm run seed
```

## API Documentation

Full reference: [docs/api.md](docs/api.md)

### Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register user |
| POST | `/api/v1/auth/verify-email` | No | Verify email |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/refresh` | Cookie | Refresh session |
| POST | `/api/v1/auth/logout` | Yes | Logout |
| GET | `/api/v1/auth/me` | Yes | Current user |
| POST | `/api/v1/auth/forgot-password` | No | Forgot password |
| POST | `/api/v1/auth/reset-password` | No | Reset password |
| POST | `/api/v1/links` | Yes | Create link |
| GET | `/api/v1/links` | Yes | List links |
| GET | `/api/v1/links/:id` | Yes | Get link |
| PATCH | `/api/v1/links/:id` | Yes | Update link |
| DELETE | `/api/v1/links/:id` | Yes | Delete link |
| GET | `/r/:shortCode` | No | Redirect (302) |
| GET | `/api/v1/analytics/overview` | Yes | Analytics overview |
| GET | `/api/v1/analytics/clicks-over-time` | Yes | Click timeline |
| GET | `/api/v1/analytics/referrers` | Yes | Top referrers |
| GET | `/api/v1/analytics/devices` | Yes | Device distribution |
| GET | `/api/v1/analytics/links/:linkId` | Yes | Per-link analytics |
| GET | `/api/v1/bio/me` | Yes | My bio profile |
| POST | `/api/v1/bio` | Yes | Create bio |
| PATCH | `/api/v1/bio` | Yes | Update bio |
| DELETE | `/api/v1/bio` | Yes | Delete bio |
| GET | `/api/v1/bio/:username` | No | Public bio |
| GET | `/api/health` | No | Health check |

## Testing

### Unit Tests (no database required)

```bash
cd server
npm test    # 214 tests
```

### Individual Suites

```bash
node src/__tests__/security.test.js     # 50 tests
node src/__tests__/analytics.test.js    # 11 tests
node src/__tests__/bio.test.js          # 11 tests
node src/__tests__/redirect.test.js     # 20 tests
node src/__tests__/validation.test.js   # 122 tests
```

### Integration Tests (requires MongoDB)

```bash
cd server
npm run test:integration    # Auth, links, bio, analytics
npm run test:all            # All tests
```

Testing documentation: [docs/testing.md](docs/testing.md)

## Security

- JWT in httpOnly cookies (not accessible via JavaScript)
- Refresh token rotation (old token invalidated on use)
- bcrypt with 12 salt rounds
- IP addresses hashed with SHA-256 (raw IP never stored)
- Rate limiting: API (100/15min), Auth (20/15min), Redirect (60/min), Bio (30/5min)
- Input validation on all endpoints
- URL validation blocking dangerous protocols
- Ownership checks on all protected resources
- Helmet security headers
- CORS restricted to configured origin
- Production mode hides error details

Security documentation: [docs/security.md](docs/security.md)

## Deployment

### Recommended Stack

| Component | Provider |
|-----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas (M0) |

### Quick Deploy

1. Create MongoDB Atlas M0 cluster
2. Deploy backend to Render with environment variables
3. Deploy frontend to Vercel with `VITE_API_URL` pointing to backend

Full guide: [docs/deployment.md](docs/deployment.md)

## Project Structure

```
short-link-bio-hub/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/ui/           # 54 Coss UI primitives
│   │   ├── components/common/       # EmptyState, Skeleton
│   │   ├── components/              # QRCodeModal, BioPreview, ProtectedRoute
│   │   ├── contexts/                # AuthContext, ToastContext
│   │   ├── hooks/                   # useLinks, useAnalytics, useBio
│   │   ├── layouts/                 # PublicLayout, DashboardLayout
│   │   ├── pages/                   # 13 page components
│   │   ├── routes/                  # AppRoutes
│   │   └── services/                # Axios API client
│   ├── package.json
│   └── vite.config.js
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/                  # env.js, db.js
│   │   ├── controllers/             # 5 controllers
│   │   ├── middleware/               # auth, validation, error handling
│   │   ├── models/                  # User, Link, ClickEvent, BioProfile
│   │   ├── routes/                  # 6 route files
│   │   ├── services/                # 6 service modules
│   │   ├── utils/                   # JWT, cookies, validation, etc.
│   │   └── __tests__/               # 10 test files
│   └── package.json
├── docs/                            # Documentation
│   ├── api.md                       # API reference
│   ├── architecture.md              # System architecture
│   ├── database.md                  # Database schema
│   ├── security.md                  # Security documentation
│   ├── testing.md                   # Testing strategy
│   ├── deployment.md                # Deployment guide
│   ├── ui-ux.md                     # Design system
│   ├── requirements-audit.md        # Requirements traceability
│   ├── test-report.md               # Test results
│   ├── known-issues.md              # Known issues
│   ├── analytics.md                 # Analytics architecture
│   ├── authentication.md            # Auth flow
│   ├── link-engine.md               # Link management
│   ├── redirect-engine.md           # Redirect flow
│   ├── qr-and-bio.md                # QR and bio
│   ├── mobile-responsive.md         # Mobile responsive design
│   └── project-summary.md           # Project summary
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

## Responsive Design

The application is fully responsive and optimized for mobile devices with a mobile-first approach:

- **Mobile-first responsive UI** using Tailwind CSS breakpoints
- **Desktop, tablet, and mobile support** from 320px to 1920px+
- **Responsive dashboard** with adaptive stat cards (2-column on mobile, 4-column on desktop)
- **Mobile navigation** with slide-out drawer menu and hamburger toggle
- **Responsive analytics** with charts that adapt to screen size
- **Mobile link library** with card-based layout on mobile
- **Responsive Link-in-Bio** with single-column editor on mobile
- **Mobile public Bio** optimized for phone screens
- **Touch-friendly interactions** with 44px minimum touch targets
- **Accessibility considerations** including keyboard navigation and screen reader support

Key responsive features:
- Navigation drawer for mobile with smooth animations
- Responsive grid layouts (2-column mobile, 4-column desktop)
- Viewport-based modal sizing
- Touch-friendly button sizes
- Safe text overflow handling
- Responsive charts with proper scaling

See [docs/mobile-responsive.md](docs/mobile-responsive.md) for complete responsive design documentation.

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/api.md) | All 25 endpoints documented |
| [Architecture](docs/architecture.md) | System and flow diagrams |
| [Database](docs/database.md) | Schema, indexes, relationships |
| [Security](docs/security.md) | Threat model and mitigations |
| [Testing](docs/testing.md) | Test strategy and execution |
| [Deployment](docs/deployment.md) | Production deployment guide |
| [UI/UX](docs/ui-ux.md) | Design system and responsive patterns |
| [Mobile Responsive](docs/mobile-responsive.md) | Mobile responsive design documentation |
| [Requirements Audit](docs/requirements-audit.md) | Project 04 requirements traceability |
| [Test Report](docs/test-report.md) | Test execution results |
| [Known Issues](docs/known-issues.md) | Identified issues |
| [Project Summary](docs/project-summary.md) | Executive summary |
| [Demo Script](docs/demo-script.md) | Presentation walkthrough |

## License

MIT
