# QR Code Generator & Link-in-Bio Hub

## QR Code Architecture

### Library

**`qrcode.react`** — lightweight React component for generating QR codes as SVG.

Chosen because:
- Pure React component (no server dependency)
- SVG output (scalable, crisp on all devices)
- ~3KB gzipped
- Well-maintained with 15k+ weekly npm downloads

### QR Flow

```
User clicks QR icon on link row
    ↓
QR Modal opens
    ↓
QRCodeSVG renders SVG encoding shortUrl
    ↓
Download: SVG → Canvas → PNG → file download
```

### QR Encodes Short URL (NOT Destination URL)

The QR code encodes the application's short URL:

```
https://your-domain.com/r/:shortCode
```

NOT the destination URL directly. This ensures QR scans generate analytics through the existing redirect engine:

```
QR scan → /r/:shortCode → 302 redirect → ClickEvent created
```

### QR Security

QR generation is **client-side only**. No backend endpoint exists for QR generation.

- The `shortUrl` is already returned by the authorized `/api/v1/links` API
- Users can only see their own links
- Ownership is enforced at the API level
- No additional server-side QR ownership check needed

### QR Download

- Format: PNG (via SVG → Canvas conversion)
- Filename: `qr-{shortCode}.png`
- No internal IDs exposed in filename

### QR Analytics

No special QR analytics system. QR scans flow through the existing redirect engine:

```
QR → /r/:shortCode → 302 → ClickEvent → Phase 6 analytics
```

---

## Link-in-Bio Architecture

### Bio Profile Model

Uses the existing `BioProfile` model from Phase 2:

```javascript
{
  user: ObjectId (ref: User, unique),
  username: String (unique, indexed, 3-30 chars),
  avatar: String (nullable),
  displayName: String (1-100 chars),
  bio: String (max 500 chars),
  theme: Enum ["Minimal Light", "Dark Slate", "Gradient"],
  socialLinks: [{
    platform: String,
    label: String,
    url: String,
    order: Number
  }]
}
```

### Username Rules

- 3-30 characters
- Only letters, numbers, hyphens, underscores
- Normalized to lowercase
- Unique index in MongoDB

### Reserved Usernames

Prevented from use: `api`, `login`, `register`, `dashboard`, `admin`, `auth`, `r`, `bio`, `favicon`, `assets`, `reset-password`, `verify-email`, `forgot-password`

### Social Links

Embedded array in BioProfile (not separate documents). Platforms supported:

- Instagram, LinkedIn, GitHub, YouTube, Twitter/X, Website

URLs validated to require HTTP/HTTPS protocol. Reordered via `order` field persisted to MongoDB.

### Theme System

Three themes implemented via `BioPreview` component:

| Theme | Background | Text | Buttons |
|-------|-----------|------|---------|
| Minimal Light | Light gray | Dark | Gray borders |
| Dark Slate | Dark slate | White | Slate borders |
| Gradient | Purple→Blue→Cyan | White | Glass-morphism |

---

## API Endpoints

### Management (Authenticated)

```
GET    /api/v1/bio/me         — Get own profile
POST   /api/v1/bio            — Create profile
PATCH  /api/v1/bio            — Update profile
DELETE /api/v1/bio            — Delete profile
```

### Public

```
GET /api/v1/bio/:username     — Get public profile
```

Returns only: `username`, `avatar`, `displayName`, `bio`, `theme`, `socialLinks`

No private fields (email, password, refreshToken, userId) are exposed.

---

## Frontend Routes

```
/dashboard/bio        — Bio editor (authenticated)
/bio/:username        — Public bio page (no auth)
```

### Bio Editor

Two-panel layout:
- Left: Settings form (username, display name, bio, avatar, theme, social links)
- Right: Live preview matching public page appearance

### Public Bio Page

- Accessible without login
- Renders BioPreview with the profile's theme
- Sets page title dynamically
- 404 state for missing profiles

---

## Security

- [x] Authentication required for management APIs
- [x] Public profile contains only public fields
- [x] User ownership enforced (req.user.id)
- [x] Username uniqueness enforced
- [x] Reserved usernames protected
- [x] Social URLs validated (HTTP/HTTPS only)
- [x] No dangerouslySetInnerHTML used
- [x] No private user data exposed
- [x] External links use target="_blank" rel="noopener noreferrer"
