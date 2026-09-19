# Demo Script — Branded Short-Link & Bio-Link Hub

## 1. Introduction

"My project is a Branded Short-Link and Bio-Link Hub — a full-stack MERN application that combines URL shortening, branded vanity links, click analytics, QR codes, and a customizable Link-in-Bio profile into one platform."

## 2. Problem

"Users often need to create branded short URLs for marketing, track engagement through analytics, generate QR codes for offline sharing, and maintain a centralized public profile with their important links. Currently this requires multiple separate tools."

## 3. Solution

"This application provides all of these capabilities in a single platform. Users can create short links with custom branded slugs, track every click with detailed analytics, generate QR codes, and build a public Link-in-Bio page — all with secure authentication."

## 4. Tech Stack

"The frontend uses React 19 with Vite, React Router for navigation, TanStack Query for server state, and Coss UI components built on Base UI and Tailwind CSS v4. Charts use Recharts. QR generation uses qrcode.react.

The backend uses Node.js with Express.js. The database is MongoDB with Mongoose. Authentication uses JWT with bcrypt for password hashing. Security includes Helmet, CORS, and express-rate-limit."

## 5. Architecture

"The architecture follows a clean separation: React frontend communicates with the Express REST API. Express uses middleware for authentication, validation, and rate limiting. Controllers handle HTTP requests, services contain business logic, and Mongoose models handle database operations.

For redirects, when a user visits a short link, Express looks up the short code in MongoDB using an indexed query, returns a 302 redirect, and logs click telemetry asynchronously so the redirect is never delayed."

## 6. Database

"There are four models. User handles authentication. Link stores short links with destination URLs and short codes. ClickEvent records individual click telemetry with timestamp, referrer, device type, and hashed IP. BioProfile stores the Link-in-Bio page data.

Key indexes include unique indexes on User email and Link shortCode for fast lookups, a compound index on Link user plus createdAt for sorted queries, and a compound index on ClickEvent link plus timestamp for analytics aggregation."

## 7. Authentication

"The auth system uses JWT access tokens with 15-minute expiry and refresh tokens with 7-day expiry. Both are stored in httpOnly cookies, so JavaScript cannot access them.

Registration creates a user with a hashed password and generates an email verification token. Login validates credentials, checks email verification, and sets both cookies. The refresh endpoint rotates tokens — the old refresh token is invalidated and new tokens are issued. Logout clears cookies and revokes the refresh token hash."

## 8. Short Links

"Users can create short links in two ways. Automatic mode generates a random 6-character alphanumeric code. Custom mode lets users choose a vanity slug like 'portfolio' or 'sale'.

The system validates the destination URL (only HTTP/HTTPS allowed), checks the slug against reserved words and existing codes, and detects collisions. If a custom slug is taken, it returns a 409 conflict."

## 9. Redirect

"When someone visits /r/ABC123, the server looks up the short code in MongoDB using an indexed query. If found and active, it returns a 302 redirect to the stored destination URL.

Simultaneously, it logs a ClickEvent asynchronously with the referrer (or 'Direct'), device type detected from the user agent, and the client IP address hashed with SHA-256. The raw IP is never stored. The link's click count is incremented atomically."

## 10. Analytics

"The analytics dashboard shows total clicks, total links, active links, and the top performing link. The clicks-over-time chart shows daily click data with missing days zero-filled. Referrers are grouped and sorted by frequency. Device distribution shows Mobile, Desktop, and Tablet percentages.

Per-link analytics provide detailed breakdowns for individual links. All data comes from real ClickEvent records — no fake or simulated data."

## 11. QR Codes

"QR codes are generated client-side using qrcode.react. The QR encodes the short link URL (not the destination directly), so QR scans are tracked in analytics just like any other click.

Users can download the QR as a PNG file. The download filename includes the short code for easy identification."

## 12. Link-in-Bio

"The Bio Editor lets users create a public profile with avatar, display name, bio text, and social links. Users can choose from three themes: Minimal Light, Dark Slate, and Gradient.

The public profile is accessible at /bio/username without authentication. It displays only public fields — no email, password, or internal data is exposed. The page is fully responsive for mobile viewing."

## 13. Security

"Security measures include: JWT in httpOnly cookies (not accessible via JavaScript), refresh token rotation on every use, bcrypt password hashing with 12 salt rounds, rate limiting on all routes, input validation on every endpoint, URL validation blocking dangerous protocols like javascript: and data:, ownership checks ensuring users can only access their own resources, IP address hashing with SHA-256, Helmet security headers, and CORS restricted to the configured origin."

## 14. Technical Decisions

"MongoDB was chosen for its flexible schema and strong aggregation pipeline for analytics. JWT with httpOnly cookies provides stateless authentication without server-side session storage. Separate ClickEvent collection (rather than just incrementing a counter) enables detailed analytics while the clickCount field provides fast access for display. QR codes encode the short URL rather than the destination to ensure analytics tracking works for QR scans."

## 15. Challenges

"Key challenges included implementing refresh token rotation securely (ensuring old tokens cannot be reused), building analytics aggregation pipelines with zero-filled date ranges, handling CORS with cookies across different domains during deployment, and ensuring the redirect never waits for telemetry processing."

## 16. Limitations

"Email verification is simulated (tokens are logged to console in development). External avatar storage is not implemented (users provide URL-based avatars). Custom domains are not configured. The application does not implement advanced caching or CDN distribution."

## 17. Live Demo

"The demo follows this sequence: Register an account, verify email, login, create a short link with a custom slug, open the short link to trigger a redirect, view analytics to see the click recorded, generate a QR code, create a Bio profile with social links, view the public Bio page, and test on mobile."
