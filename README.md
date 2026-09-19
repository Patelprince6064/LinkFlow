# LinkHub — Short Links & Bio Hub

A production-quality URL shortening engine with custom vanity slugs, click telemetry analytics, and a customizable Link-in-Bio hub manager. Built as a Bitly + Linktree hybrid.

## Development Status

**Current Phase:** Phase 1 — Project Foundation  
Phase 1 establishes the complete project architecture, tooling, and base infrastructure. Application features are implemented in subsequent phases.

## Technology Stack

**Frontend:**
- React 19 + Vite
- React Router v7
- TanStack Query (server-state management)
- Axios (HTTP client)
- Coss UI components (copy-paste primitives on Base UI + Tailwind CSS v4)

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Helmet (security headers)
- CORS (cross-origin configuration)
- cookie-parser (cookie handling)
- bcrypt (password hashing — future)
- jsonwebtoken (JWT auth — future)
- express-rate-limit (rate limiting)

**Development:**
- Concurrently (parallel dev servers)
- Nodemon (backend hot-reload)
- ESLint / OxLint

## Project Structure

```
short-link-bio-hub/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/ui/   # Coss UI primitives
│   │   ├── layouts/         # PublicLayout, DashboardLayout
│   │   ├── pages/           # Home, Login, Register, Dashboard
│   │   ├── routes/          # AppRoutes (route definitions)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client (Axios)
│   │   ├── lib/             # Utility libraries (cn helper)
│   │   └── utils/           # Shared utilities
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # env.js, db.js
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Error handling, auth, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── utils/           # AppError, helpers
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   └── package.json
├── docs/
│   └── architecture.md      # Architecture documentation
├── .env.example
├── .gitignore
├── package.json             # Root scripts (concurrently)
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas)
- Git

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd short-link-bio-hub

# Install all dependencies (root, client, server)
npm run install:all
```

## Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your configuration
```

Required variables:
- `MONGODB_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET` — Secret for signing access tokens
- `JWT_REFRESH_SECRET` — Secret for signing refresh tokens

## MongoDB Setup

Ensure MongoDB is running locally on port 27017, or update `MONGODB_URI` in your `.env` to point to your MongoDB Atlas cluster.

```bash
# Local MongoDB (default)
mongodb://localhost:27017/short_link_bio_hub
```

## Running the Application

```bash
# Start both frontend and backend
npm run dev

# Start individually
npm run client    # Frontend on http://localhost:5173
npm run server    # Backend on http://localhost:5000
```

## Health-Check Endpoint

```bash
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-09-19T00:00:00.000Z"
}
```

## Security Notes

- Helmet sets secure HTTP headers
- CORS restricted to `CLIENT_URL` origin
- Rate limiting: 100 requests per 15 minutes on `/api` routes
- Request body size limited to 10mb
- Stack traces hidden in production mode
- `.env` files excluded from version control

## Planned Development Phases

| Phase | Description |
|-------|------------|
| **Phase 1** | Project foundation and architecture (current) |
| **Phase 2** | JWT authentication (signup, login, refresh tokens) |
| **Phase 3** | URL shortening engine (vanity slugs, short codes, redirect) |
| **Phase 4** | Click analytics and telemetry |
| **Phase 5** | Link-in-Bio profile builder |
| **Phase 6** | Dashboard, QR codes, and polish |
