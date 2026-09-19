# Testing Documentation

## Overview

LinkFlow uses a custom test runner (no external test framework). Tests are run directly with `node` and use ES module syntax.

## Test Strategy

### 1. Unit Testing

Pure function testing with no database or network dependencies.

**What:** Validation functions, utility functions, URL detection
**Why:** Ensure input handling is correct at the lowest level
**Files:** `security.test.js`, `validation.test.js`

### 2. Integration Testing

Tests that require a MongoDB connection and test the full service layer.

**What:** Auth flows, link CRUD, bio CRUD, analytics aggregation
**Why:** Verify business logic works correctly with the database
**Files:** `auth.test.js`, `links.test.js`, `bio-full.test.js`, `analytics-db.test.js`

### 3. API Testing

Tests that verify HTTP endpoints (manual or via integration tests).

**What:** Request/response cycle, middleware chain, status codes
**Why:** Ensure the API contract is correct
**Status:** Covered through service-layer integration tests

### 4. Authentication Testing

**What:** Register, login, logout, token refresh, password reset
**Why:** Security-critical functionality must be thoroughly verified
**Test Cases:**
- Valid registration creates user with hashed password
- Duplicate email rejected
- Invalid credentials rejected
- Unverified email blocked
- Token rotation on refresh
- Old refresh token cannot be reused
- Logout clears session
- Password reset invalidates sessions

### 5. Authorization Testing

**What:** Ownership enforcement across links, bio, analytics
**Why:** Users must not access other users' resources
**Test Cases:**
- User A cannot read/edit/delete User B's links
- User A cannot access User B's analytics
- User A cannot modify User B's bio

### 6. Security Testing

**What:** Input validation, URL sanitization, XSS prevention
**Why:** Prevent injection attacks and data exposure
**Test Cases:**
- javascript: URLs rejected
- data: URLs rejected
- Path traversal in slugs rejected
- Regex injection in search prevented
- Password never returned in API responses
- JWT never exposed to client JavaScript

### 7. Database Testing

**What:** Model constraints, indexes, unique constraints
**Why:** Data integrity at the database level
**Test Cases:**
- Unique email constraint on User
- Unique shortCode constraint on Link
- Unique username constraint on BioProfile
- Index existence verification

### 8. Redirect Testing

**What:** Short code resolution, 302 redirect, click telemetry
**Why:** Core functionality of the link shortener
**Test Cases:**
- Valid short code resolves to destination
- 302 status code returned
- ClickEvent created on redirect
- clickCount incremented atomically
- Inactive links not redirected
- Nonexistent codes return 404

### 9. Analytics Testing

**What:** Aggregation pipelines, date range handling, ownership
**Why:** Analytics must be accurate and user-isolated
**Test Cases:**
- Overview returns correct totals
- Clicks over time zero-fills missing days
- Referrers grouped correctly
- Device distribution percentages sum to 100
- Per-link analytics scoped to owner
- Empty states handled gracefully

### 10. Bio Testing

**What:** Profile CRUD, username validation, themes, social links
**Why:** Public-facing feature must handle edge cases
**Test Cases:**
- Username validation (length, characters, reserved)
- Theme validation (3 allowed values)
- Social link URL validation
- Public profile hides sensitive data
- One profile per user enforced

## Test Environment

### Database Isolation

Tests use a separate database: `short_link_bio_hub_test`

Configuration in `server/src/config/testEnv.js`:
- `NODE_ENV=test`
- `MONGODB_URI=mongodb://localhost:27017/short_link_bio_hub_test`
- Separate JWT secrets for test isolation

### Test Data

Controlled fixtures in `server/src/__tests__/helpers/fixtures.js`:
- `testUser` / `testUser2` — User credentials
- `testLink` / `testLinkWithSlug` — Link creation data
- `testBio` / `testBio2` — Bio profile data
- User agents for device detection testing
- JWT token generators for various scenarios

### Cleanup

Each test suite:
1. Connects to test database
2. Clears all collections before tests
3. Drops test database and disconnects after tests

**No production data is ever touched.**

## Running Tests

### Unit Tests (no database required)

```bash
cd server
npm test
```

Runs: `security.test.js`, `analytics.test.js`, `bio.test.js`, `redirect.test.js`, `validation.test.js`

### Individual Test Suites

```bash
node src/__tests__/security.test.js      # 50 tests
node src/__tests__/analytics.test.js     # 11 tests
node src/__tests__/bio.test.js           # 11 tests
node src/__tests__/redirect.test.js      # 20 tests
node src/__tests__/validation.test.js    # 122 tests
```

### Integration Tests (requires MongoDB)

```bash
npm run test:integration
```

Runs: `auth.test.js`, `links.test.js`, `bio-full.test.js`, `analytics-db.test.js`

### All Tests

```bash
npm run test:all
```

## Test Results

### Unit Tests (No Database)

| Suite | Tests | Status |
|-------|-------|--------|
| security.test.js | 50 | PASS |
| analytics.test.js | 11 | PASS |
| bio.test.js | 11 | PASS |
| redirect.test.js | 20 | PASS |
| validation.test.js | 122 | PASS |
| **Total** | **214** | **ALL PASS** |

### Integration Tests (Requires MongoDB)

| Suite | Tests | Status |
|-------|-------|--------|
| auth.test.js | ~35 | NOT TESTED (no MongoDB) |
| links.test.js | ~40 | NOT TESTED (no MongoDB) |
| bio-full.test.js | ~30 | NOT TESTED (no MongoDB) |
| analytics-db.test.js | ~25 | NOT TESTED (no MongoDB) |

**Note:** Integration tests are written and ready to run when MongoDB is available.

## Expected Behavior

| Action | Expected Result |
|--------|----------------|
| Register with valid data | User created, verification token returned |
| Register with duplicate email | 409 Conflict |
| Login with correct credentials | Cookies set, user returned |
| Login with wrong password | 401 Unauthorized |
| Login with unverified email | 403 Forbidden |
| Create link with valid URL | Link created with 6-char code |
| Create link with javascript: URL | 400 Bad Request |
| Redirect with valid code | 302 to destination |
| Redirect with invalid code | 404 Not Found |
| Access other user's link | 404 Not Found |
| Create bio with reserved username | 400 Bad Request |
| Get public bio | Only public fields returned |

## Frontend Testing

### Manual Test Checklist

**Authentication:**
- [ ] Register form validates inputs
- [ ] Login sets auth state
- [ ] Logout clears auth state
- [ ] Refresh maintains session
- [ ] Forgot password sends email (console in dev)
- [ ] Reset password works

**Links:**
- [ ] Create link with auto code
- [ ] Create link with custom slug
- [ ] Search filters results
- [ ] Pagination works
- [ ] Copy short URL works
- [ ] Delete link works
- [ ] QR code generates

**Analytics:**
- [ ] Overview shows correct data
- [ ] Date range filtering works
- [ ] Charts render
- [ ] Per-link analytics accessible

**Bio:**
- [ ] Create profile works
- [ ] Edit profile works
- [ ] Theme selection works
- [ ] Social links add/remove
- [ ] Public bio accessible

**Responsive:**
- [ ] Mobile navigation works
- [ ] Tables convert to cards on mobile
- [ ] Forms are usable on small screens
- [ ] Charts resize appropriately

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Error messages announced
- [ ] Forms have labels

## Production Build Testing

```bash
cd client && npm run build
```

Verify:
- No build errors
- No missing imports
- Bundle size reasonable (~800KB JS)
- CSS generated correctly
