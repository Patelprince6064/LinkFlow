# Analytics Engine

The analytics system provides real-time click metrics, device distribution, referrer tracking, and per-link performance dashboards using MongoDB aggregation pipelines and Recharts visualizations.

## Architecture

### Backend Flow

```
ClickEvent (Phase 5)
    ↓
Analytics Service (aggregation pipelines)
    ↓
Analytics Controller → Analytics Routes (/api/v1/analytics/*)
    ↓
Frontend (useAnalytics hooks → Analytics pages with Recharts)
```

### Frontend Flow

```
Analytics Dashboard (/dashboard/analytics)
    ├── Overview Cards (total clicks, total links, active links, top link)
    ├── Clicks Over Time (LineChart)
    ├── Device Distribution (PieChart)
    ├── Top Referrers (bar list)
    └── Link Performance table

Per-Link Analytics (/dashboard/analytics/:linkId)
    ├── Stats cards (clicks, unique referrers, short code)
    ├── Clicks Over Time (LineChart)
    ├── Device Distribution (PieChart)
    └── Top Referrers (bar list)
```

## API Endpoints

### Overview

```
GET /api/v1/analytics/overview?startDate=2025-01-01&endDate=2025-01-31
```

Returns: `{ totalClicks, totalLinks, activeLinks, topLink }`

### Clicks Over Time

```
GET /api/v1/analytics/clicks-over-time?startDate=2025-01-01&endDate=2025-01-31&interval=day
```

Returns: `[{ date: "2025-01-01", clicks: 42 }, ...]`

### Top Referrers

```
GET /api/v1/analytics/referrers?startDate=2025-01-01&endDate=2025-01-31&limit=10
```

Returns: `[{ referrer: "google.com", clicks: 150 }, ...]`

### Device Distribution

```
GET /api/v1/analytics/devices?startDate=2025-01-01&endDate=2025-01-31
```

Returns: `[{ deviceType: "Mobile", clicks: 200, percentage: 60 }, ...]`

### Per-Link Analytics

```
GET /api/v1/analytics/links/:linkId?startDate=2025-01-01&endDate=2025-01-31
```

Returns: `{ link: {...}, totalClicks, clicksOverTime: [...], referrers: [...], devices: [...] }`

## Backend Implementation

### Analytics Service (`server/src/services/analytics.service.js`)

- **Date Range Handling**: Default 7-day range, max 90-day limit
- **Ownership Scoping**: All queries filtered by user's links via `getUserLinkIds()`
- **Aggregation Pipelines**: MongoDB `$group`, `$match`, `$sort`, `$count`, `$lookup`
- **Device Distribution**: Groups by `deviceType` (Mobile/Desktop/Tablet), calculates percentages
- **Clicks Over Time**: Groups by `$dateToString`, fills missing dates with 0 clicks
- **Top Referrers**: Groups by `referrer` field with configurable limit (max 50)

### Analytics Controller (`server/src/controllers/analytics.controller.js`)

- Delegates to service layer via `asyncHandler` wrapper
- Extracts query params (startDate, endDate, limit) from `req.query`
- Uses `req.user.id` for ownership scoping

### Analytics Routes (`server/src/routes/analytics.routes.js`)

- All routes require authentication (`requireAuth` middleware)
- Mounted at `/api/v1/analytics`

## Frontend Implementation

### Analytics Hooks (`client/src/hooks/useAnalytics.js`)

- `useAnalyticsOverview({ startDate, endDate })` — Overview stats
- `useClicksOverTime({ startDate, endDate })` — Time series data
- `useTopReferrers({ startDate, endDate, limit })` — Referrer rankings
- `useDeviceDistribution({ startDate, endDate })` — Device breakdown
- `useLinkAnalytics(linkId, { startDate, endDate })` — Per-link metrics
- All hooks use TanStack Query with query key-based cache invalidation

### Analytics Dashboard (`client/src/pages/Analytics.jsx`)

- Date range presets (7d, 30d, 90d) with `useMemo` for date calculation
- 4 stat cards (clicks, links, active, top link)
- LineChart for clicks over time (Recharts)
- PieChart for device distribution
- Top referrers list
- Link performance table with "View" links to per-link analytics
- Manual refresh button

### Per-Link Analytics (`client/src/pages/LinkAnalytics.jsx`)

- Route: `/dashboard/analytics/:linkId`
- Back navigation to main analytics
- 3 stat cards (clicks, unique referrers, short code)
- LineChart for clicks over time
- PieChart for device distribution
- Top referrers list

## Testing

```bash
cd server && npx vitest run src/__tests__/analytics.test.js
```

Tests cover:
- Service function signatures and parameter handling
- Controller exports
- Empty state handling (no links, no clicks)
- Date range parsing defaults
- Response structure validation
