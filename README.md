# LinkHub — Branded Short-Link & Bio-Link Hub

A production-quality URL shortening engine with custom vanity slugs, real-time click telemetry analytics, QR code generation, and a customizable Link-in-Bio hub manager. Built as a Bitly + Linktree hybrid.

## Features

- **Short Links** — Automatic 6-character codes or custom vanity slugs
- **302 Redirects** — Fast redirect engine with async click telemetry
- **Click Analytics** — Real-time device, referrer, and timeline analytics
- **QR Codes** — Client-side QR generation with PNG download
- **Bio Profiles** — Customizable Link-in-Bio pages with 3 themes
- **Authentication** — JWT with httpOnly cookies, refresh token rotation
- **Security** — Rate limiting, input validation, IP hashing, Helmet headers

## Tech Stack

**Frontend:**
- React 19 + Vite 8
- React Router v7
- TanStack Query (server-state management)
- Recharts (analytics charts)
- qrcode.react (QR generation)
- Coss UI components (shadcn-style on Base UI + Tailwind CSS v4)

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose 8
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- express-rate-limit (rate limiting)
- Helmet (security headers)

## Project Structure

```
short-link-bio-hub/
├── client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── components/ui/       # 54 Coss UI primitives
│   │   ├── components/common/   # UIComponents (EmptyState, Skeleton)
│   │   ├── contexts/            # AuthContext, ToastContext
│   │   ├── hooks/               # useLinks, useAnalytics, useBio
│   │   ├── layouts/             # PublicLayout, DashboardLayout
│   │   ├── pages/               # 14 page components
│   │   ├── routes/              # AppRoutes
│   │   └── services/            # Axios API client
│   └── package.json
├── server/                      # Express backend
│   ├── src/
│   │   ├── config/              # env.js, db.js
│   │   ├── controllers/         # 5 controllers
│   │   ├── middleware/           # auth, validation, error handling
│   │   ├── models/              # User, Link, ClickEvent, BioProfile
│   │   ├── routes/              # 6 route files
│   │   ├── services/            # 6 service modules
│   │   ├── utils/               # JWT, cookies, validation, etc.
│   │   └── __tests__/           # 10 test files (214+ tests)
│   └── package.json
├── docs/                        # Documentation
│   ├── api.md                   # Complete API reference
│   ├── architecture.md          # System architecture
│   ├── database.md              # Database schema docs
│   ├── security.md              # Security documentation
│   ├── testing.md               # Testing strategy
│   ├── requirements-audit.md    # Requirements traceability
│   ├── test-report.md           # Test execution report
│   ├── known-issues.md          # Known issues
│   ├── analytics.md             # Analytics architecture
│   ├── authentication.md        # Auth flow docs
│   ├── link-engine.md           # Link engine docs
│   ├── redirect-engine.md       # Redirect flow docs
│   ├── qr-and-bio.md            # QR & Bio docs
│   └── ui-ux.md                 # UI/UX design system
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/Patelprince6064/LinkFlow.git
cd short-link-bio-hub

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

## Environment Variables

```bash
cp .env.example .env
```

Required variables in `.env`:
- `MONGODB_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET` — Secret for signing access tokens (random 64+ char string)
- `JWT_REFRESH_SECRET` — Secret for signing refresh tokens (different from access)
- `CLIENT_URL` — Frontend URL (default: http://localhost:5173)
- `PUBLIC_BASE_URL` — Backend public URL (default: http://localhost:5000)

## Running the Application

```bash
# Start both frontend and backend (from root)
npm run dev

# Or start individually
cd server && npm run dev    # Backend on http://localhost:5000
cd client && npm run dev    # Frontend on http://localhost:5173
```

## Seed Data (Optional)

```bash
cd server && npm run seed
```

Creates a test user, links, and bio profile for development.

## Testing

### Unit Tests (no database required)

```bash
cd server
npm test                    # Run all unit tests (214 tests)
```

Individual suites:
```bash
node src/__tests__/security.test.js      # 50 tests — validation & security
node src/__tests__/validation.test.js    # 122 tests — comprehensive validation
node src/__tests__/redirect.test.js      # 20 tests — device detection, IP hashing
node src/__tests__/analytics.test.js     # 11 tests — export verification
node src/__tests__/bio.test.js           # 11 tests — export verification
```

### Integration Tests (requires MongoDB)

```bash
cd server
npm run test:integration     # Auth, links, bio, analytics DB tests
npm run test:all             # All tests
```

## API Documentation

Complete API reference: [docs/api.md](docs/api.md)

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/links | Create short link |
| GET | /api/v1/links | List user's links |
| GET | /r/:shortCode | Redirect (302) |
| GET | /api/v1/analytics/overview | Analytics overview |
| GET | /api/v1/bio/:username | Public bio profile |
| GET | /api/health | Health check |

## Rate Limits

| Route | Limit | Window |
|-------|-------|--------|
| /api/* | 100 requests | 15 minutes |
| /api/v1/auth/* | 20 requests | 15 minutes |
| /r/* | 60 requests | 1 minute |
| /api/v1/bio/* | 30 requests | 5 minutes |

## Security

- JWT access tokens (15m) + refresh tokens (7d) in httpOnly cookies
- Refresh token rotation on every use
- bcrypt password hashing (12 salt rounds)
- IP addresses hashed with SHA-256 (never stored raw)
- Input validation on all endpoints
- Rate limiting on all routes
- Helmet HTTP security headers
- CORS with credentials
- No localStorage/sessionStorage usage
- No dangerouslySetInnerHTML usage
- Production mode hides error details

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/api.md) | Complete endpoint documentation |
| [Architecture](docs/architecture.md) | System architecture |
| [Database](docs/database.md) | Schema and index documentation |
| [Security](docs/security.md) | Threat model and mitigations |
| [Testing](docs/testing.md) | Test strategy and execution |
| [Requirements Audit](docs/requirements-audit.md) | Project 04 requirements traceability |
| [Test Report](docs/test-report.md) | Test execution results |
| [Known Issues](docs/known-issues.md) | Identified issues |
| [UI/UX Design System](docs/ui-ux.md) | Component and responsive patterns |
| [Analytics](docs/analytics.md) | Analytics architecture |
| [Authentication](docs/authentication.md) | Auth flow documentation |
| [Link Engine](docs/link-engine.md) | Link creation and management |
| [Redirect Engine](docs/redirect-engine.md) | Redirect and telemetry flow |
| [QR & Bio](docs/qr-and-bio.md) | QR codes and bio profiles |

## Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project foundation (Express/React/Vite) | Complete |
| 2 | Database models (User, Link, ClickEvent, BioProfile) | Complete |
| 3 | Authentication (JWT, cookies, refresh rotation) | Complete |
| 4 | Link CRUD (short codes, vanity slugs, collision detection) | Complete |
| 5 | 302 redirect + async click telemetry | Complete |
| 6 | Analytics dashboard (Recharts, date presets) | Complete |
| 7 | QR codes + Link-in-Bio profiles + 3 themes | Complete |
| 8 | Security hardening (validation, rate limits, logging) | Complete |
| 9 | UI/UX polish (responsive, accessibility, toasts) | Complete |
| 10 | Testing, API docs, requirements audit | Complete |
| 11 | Deployment config + production preparation | Complete |

## Deployment

### Quick Start (Production)

1. **MongoDB Atlas** — Create M0 cluster, get connection string
2. **Backend (Render)** — Deploy `server/` directory, set environment variables
3. **Frontend (Vercel)** — Deploy `client/` directory, set `VITE_API_URL`

Detailed instructions: [docs/deployment.md](docs/deployment.md)

### Environment Variables

Copy `.env.example` to `.env` and configure. Key production variables:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/linkflow
CLIENT_URL=https://your-frontend.vercel.app
PUBLIC_BASE_URL=https://your-backend.onrender.com
JWT_ACCESS_SECRET=<random 64+ chars>
JWT_REFRESH_SECRET=<random 64+ chars, different from access>
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

### Frontend Build

```bash
cd client && npm run build    # Outputs to dist/
```

### Backend Start

```bash
cd server && node src/server.js
```

## License

MIT
