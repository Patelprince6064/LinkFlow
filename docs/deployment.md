# Deployment Documentation

## Architecture

The application consists of three components:

1. **Frontend** — React SPA (static files served via CDN)
2. **Backend** — Express.js API server
3. **Database** — MongoDB (managed cloud service)

## Recommended Providers

| Component | Provider | Free Tier |
|-----------|----------|-----------|
| Frontend | Vercel | Yes — unlimited static sites |
| Backend | Render | Yes — 750 hours/month |
| Database | MongoDB Atlas | Yes — M0 cluster (512MB) |

Alternatives: Netlify (frontend), Railway (backend), Fly.io (backend).

## Prerequisites

- GitHub repository with code pushed
- MongoDB Atlas account
- Vercel account
- Render account

## Step 1: MongoDB Atlas

1. Create M0 cluster at mongodb.com/atlas
2. Create database user (Database Access)
3. Whitelist IP addresses (Network Access) — use 0.0.0.0/0 for Render/Vercel
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/linkflow`
5. Create database `linkflow`

## Step 2: Backend (Render)

1. Connect GitHub repo on render.com
2. Create Web Service
3. Settings:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node src/server.js`
4. Environment Variables:
   - `NODE_ENV` = production
   - `PORT` = 5000
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_URL` = your Vercel frontend URL
   - `PUBLIC_BASE_URL` = your Render backend URL
   - `JWT_ACCESS_SECRET` = generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `JWT_REFRESH_SECRET` = different random string
   - `ACCESS_TOKEN_EXPIRES_IN` = 15m
   - `REFRESH_TOKEN_EXPIRES_IN` = 7d
   - `COOKIE_SECURE` = true
   - `COOKIE_SAME_SITE` = none

## Step 3: Frontend (Vercel)

1. Import GitHub repo on vercel.com
2. Framework: Vite
3. Root Directory: `client`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_URL` = your Render backend URL + `/api` (e.g., `https://linkflow-api.onrender.com/api`)

## Step 4: CORS Update

After deployment, the backend `CLIENT_URL` must match the exact Vercel URL (e.g., `https://linkflow-xyz.vercel.app`).

The frontend `VITE_API_URL` must point to the Render backend (e.g., `https://linkflow-api.onrender.com/api`).

## Step 5: Verify

1. Open Vercel URL
2. Register account
3. Create short link
4. Open short link — verify 302 redirect
5. Check analytics
6. Test QR generation
7. Test bio page

## Environment Variables Reference

| Variable | Development | Production |
|----------|-------------|------------|
| NODE_ENV | development | production |
| PORT | 5000 | 5000 (or provider default) |
| MONGODB_URI | mongodb://localhost:27017/linkflow | mongodb+srv://... |
| CLIENT_URL | http://localhost:5173 | https://your-vercel.vercel.app |
| PUBLIC_BASE_URL | http://localhost:5000 | https://your-render.onrender.com |
| JWT_ACCESS_SECRET | dev-secret | random 64+ char string |
| JWT_REFRESH_SECRET | dev-secret-2 | different random string |
| ACCESS_TOKEN_EXPIRES_IN | 15m | 15m |
| REFRESH_TOKEN_EXPIRES_IN | 7d | 7d |
| COOKIE_SECURE | false | true |
| COOKIE_SAME_SITE | lax | none |
| VITE_API_URL | (not set, uses /api) | https://your-render.onrender.com/api |

## Troubleshooting

### CORS Error
- Ensure `CLIENT_URL` on backend matches exact Vercel URL (with https://)
- Ensure `credentials: true` in frontend axios config

### Cookie Not Sent
- Set `COOKIE_SECURE=true` in production
- Set `COOKIE_SAME_SITE=none` for cross-origin
- Ensure frontend and backend are on HTTPS

### MongoDB Connection Failed
- Check Atlas connection string
- Verify database user credentials
- Check IP whitelist includes 0.0.0.0/0

### SPA Routing 404
- Vercel handles this automatically with rewrites
- For other platforms, add SPA fallback configuration

### Short Links Point to localhost
- Set `PUBLIC_BASE_URL` to actual backend URL
- Rebuild and restart backend

## Known Limitations

- Render free tier spins down after 15 minutes of inactivity (first request may take 30s)
- MongoDB Atlas M0 has 512MB storage limit
- No custom domain configured (uses provider subdomains)
