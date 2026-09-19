# Redirect Engine Architecture

## Overview

Production-quality URL redirection with asynchronous click telemetry. The core redirect path is optimized for speed — analytics are processed after the 302 response is sent.

## Redirect Flow

```
Request → Rate Limiter → Indexed ShortCode Lookup → Is Active?
  ├── No  → 404
  └── Yes → 302 Redirect → Async Telemetry
                              ├── ClickEvent creation
                              └── $inc clickCount
```

## GET /r/:shortCode

- **No authentication required** — anyone can access short links
- **HTTP 302 Found** — temporary redirect (not 301)
- **Rate limited:** 60 requests per minute per IP

## ShortCode Lookup

- Uses indexed `shortCode` field on Link model
- `Link.findOne({ shortCode })` — O(1) index lookup
- No collection scans

## Click Telemetry

Each real click produces:

| Field | Source |
|-------|--------|
| linkId | Resolved Link._id |
| timestamp | Current time (schema default) |
| referrer | `req.get("referer")` or "Direct" |
| deviceType | Detected from User-Agent |
| ipHash | SHA-256 hash of client IP |

## Device Detection

| Detection | Result |
|-----------|--------|
| Android/iPhone/BlackBerry/Opera Mini | Mobile |
| iPad/Android tablet/Silk | Tablet |
| Default/Desktop browsers | Desktop |

Utility: `server/src/utils/deviceDetector.js`

## IP Hashing

- **Algorithm:** SHA-256
- **Input:** Raw IP from `req.ip`
- **Output:** 64-character hex string
- **Raw IP is NEVER stored** in MongoDB
- Deterministic — same IP always produces same hash for analytics grouping

## Atomic Click Count

```js
Link.findByIdAndUpdate(linkId, { $inc: { clickCount: 1 } })
```

- Uses MongoDB `$inc` — atomic, no race conditions
- Safe for concurrent requests
- `clickCount` is a cached counter; `ClickEvent` is the source of truth

## Source of Truth

- **ClickEvent** → detailed analytics (referrers, devices, time series)
- **Link.clickCount** → fast display counter for dashboard
- They may diverge if telemetry fails; ClickEvent remains authoritative

## Async Telemetry

```js
res.redirect(302, destinationUrl);
recordClick(...); // runs after response sent
```

- Redirect response is NOT blocked by analytics
- If telemetry fails, the redirect still succeeds
- Errors are logged, not thrown
- **Tradeoff:** In-process async work is not guaranteed durable (no message queue). Acceptable for this assessment scale.

## Rate Limiting

| Route | Window | Max |
|-------|--------|-----|
| `/r/:shortCode` | 1 minute | 60 |
| Auth endpoints | 15 minutes | 20 |

## Security

- Destination URL comes ONLY from stored Link document
- Client-provided URLs are never trusted during redirect
- Disabled links (`isActive: false`) return 404, not redirected
- No open redirect vulnerability
- Raw IPs never stored
- ShortCode lookup is indexed

## Proxy Configuration

Express `trust proxy` is not enabled by default. When deployed behind a reverse proxy (Render, Railway, Nginx), set:

```js
app.set("trust proxy", 1);
```

This trusts the first `X-Forwarded-For` hop. Document the deployment-specific setting.

## Failure Handling

| Scenario | Behavior |
|----------|----------|
| Link not found | 404 |
| Link disabled | 404 |
| Telemetry fails | Redirect still works, error logged |
| Rate limit exceeded | 429 |

## Performance

- ShortCode lookup: O(1) index query
- 302 response sent before telemetry processing
- No expensive aggregation during redirect
- No dashboard computation during redirect
