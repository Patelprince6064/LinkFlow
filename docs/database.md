# Database Architecture

## Collections

### User

Stores authentication and account data.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | String | Yes | Trimmed, max 100 chars |
| email | String | Yes | Unique, lowercase, trimmed, validated format |
| passwordHash | String | Yes | bcrypt hash, never selected by default |
| role | String | No | `user` or `admin`, defaults to `user` |
| createdAt | Date | Auto | Via `timestamps: true` |
| updatedAt | Date | Auto | Via `timestamps: true` |

**Indexes:** `{ email: 1 }` (unique via unique constraint)

---

### Link

Short link records owned by a user.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| user | ObjectId | Yes | Ref → User, indexed |
| destinationUrl | String | Yes | Validated HTTP/HTTPS only |
| shortCode | String | Yes | Unique, indexed, 3-20 chars, alphanumeric + hyphen + underscore |
| clickCount | Number | No | Cached counter, defaults to 0 |
| isActive | Boolean | No | Defaults to true |
| createdAt | Date | Auto | Via `timestamps: true` |
| updatedAt | Date | Auto | Via `timestamps: true` |

**Indexes:**
- `{ shortCode: 1 }` — primary lookup for `GET /r/:shortCode`
- `{ user: 1, createdAt: -1 }` — user's link library, sorted by newest

---

### ClickEvent

Individual click telemetry records. Each record represents one real click.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| link | ObjectId | Yes | Ref → Link, indexed |
| timestamp | Date | Yes | Defaults to `Date.now` |
| referrer | String | No | HTTP referrer, nullable |
| deviceType | String | Yes | Enum: `Mobile`, `Desktop`, `Tablet` |
| ipHash | String | No | SHA-256 hash of IP, never raw IP |

**Indexes:**
- `{ link: 1, timestamp: -1 }` — clicks for a link, newest first (supports analytics queries)
- `{ timestamp: -1 }` — global time-based queries

**No `timestamps: true`** — `timestamp` field is the click time, not document creation time.

---

### BioProfile

Public link-in-bio profile page data.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| user | ObjectId | Yes | Ref → User, unique (one profile per user) |
| username | String | Yes | Unique, indexed, 3-30 chars, alphanumeric + hyphen + underscore |
| avatar | String | No | URL to avatar image |
| displayName | String | Yes | Max 100 chars |
| bio | String | No | Max 500 chars, defaults to empty string |
| theme | String | Yes | Enum: `Minimal Light`, `Dark Slate`, `Gradient` |
| socialLinks | Array | No | Embedded subdocuments, max 10 |
| socialLinks[].platform | String | Yes | e.g. GitHub, LinkedIn, Instagram |
| socialLinks[].label | String | No | Display label |
| socialLinks[].url | String | Yes | Validated HTTP/HTTPS |
| socialLinks[].order | Number | No | Sort order, defaults to 0 |
| createdAt | Date | Auto | Via `timestamps: true` |
| updatedAt | Date | Auto | Via `timestamps: true` |

**Indexes:**
- `{ username: 1 }` — primary lookup for `GET /bio/:username`

---

## Relationships

```
User
 ├──< Link          (User 1 ──── N Link)
 │     └──< ClickEvent  (Link 1 ──── N ClickEvent)
 │
 └──── BioProfile    (User 1 ──── 1 BioProfile)
```

- **User → Link:** `Link.user` references `User._id` via ObjectId
- **Link → ClickEvent:** `ClickEvent.link` references `Link._id` via ObjectId
- **User → BioProfile:** `BioProfile.user` references `User._id` via ObjectId (unique)

---

## Why References Over Embedding

1. **Scalability:** ClickEvent collection grows independently of Link documents
2. **Query performance:** Indexes on ClickEvent support efficient aggregation without scanning embedded arrays
3. **Atomicity:** Updates to one collection don't lock others
4. **Flexibility:** Queries like "all clicks across all links for a user" are straightforward with references

---

## Why ClickEvent Is Separate

- ClickEvent records are write-heavy (one per click) while Link records are read-heavy
- Separate collection allows independent indexing strategy
- Aggregation pipelines operate efficiently on ClickEvent without touching Link documents
- `clickCount` on Link is a **cached counter** for quick display; ClickEvent is the **source of truth** for analytics

---

## Validation Rules

| Model | Field | Rule |
|-------|-------|------|
| User | email | Required, unique, lowercase, valid format |
| User | passwordHash | Required, select: false |
| User | role | Enum: user, admin |
| Link | destinationUrl | Required, HTTP/HTTPS only |
| Link | shortCode | Required, unique, 3-20 chars, `/^[a-zA-Z0-9_-]+$/` |
| Link | clickCount | Min 0 |
| ClickEvent | deviceType | Enum: Mobile, Desktop, Tablet |
| ClickEvent | timestamp | Required, default Date.now |
| BioProfile | username | Required, unique, 3-30 chars, `/^[a-zA-Z0-9_-]+$/` |
| BioProfile | theme | Enum: Minimal Light, Dark Slate, Gradient |
| BioProfile | displayName | Required, max 100 chars |
| BioProfile | socialLinks | Max 10 items, each with valid URL |

---

## Security Considerations

- **Passwords:** Stored as bcrypt hashes via `passwordHash`, never plaintext. `select: false` prevents accidental exposure in queries.
- **IP addresses:** Never stored raw. Only SHA-256 hashed `ipHash` is persisted for analytics.
- **URL validation:** Destination URLs and social link URLs are validated to be HTTP/HTTPS only. `javascript:`, `data:`, `file:` schemes are rejected.
- **Unique constraints:** Email, shortCode, and username uniqueness enforced at the database level.
- **No secrets in code:** All credentials via environment variables.

---

## Future Scalability

- **ClickEvent partitioning:** Can be partitioned by timestamp for time-series queries
- **Aggregation pipeline:** MongoDB aggregation on ClickEvent for analytics (referrers, devices, time series)
- **Read replicas:** Separate read-heavy analytics queries from write path
- **Caching layer:** Redis for hot shortCode lookups if needed
- **Sharding:** ClickEvent collection can be sharded by `link` or `timestamp`
