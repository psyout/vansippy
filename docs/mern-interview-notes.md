# VanSippy (MERN) — Interview Summary

## What it is
- A Vancouver happy‑hour finder built as a **MERN monorepo**.
- React SPA (Mapbox map + venue list) ↔ Express API ↔ MongoDB (Mongoose).

## Repo layout
```
web-app/
  client/   # React (CRA), React Router, Mapbox, Material‑UI, Axios
  server/   # Express, Mongoose, JWT, bcrypt, Helmet, rate‑limit
```

## Frontend flow
- `App.jsx` defines routes (`/`, `/admin`, `/add-location`, `/edit-business/:id`).
- `Home` fetches `GET /api/locations` → renders map markers + list.
- Protected routes use `ProtectedRoute` → calls `GET /api/auth/me` (cookie‑based) → redirects if unauthenticated.
- Admin pages (`Admin`, `AddLocation`, `EditBusiness`) call `POST/PUT/DELETE /api/locations/*` with `credentials: include`.

## Backend flow
- `server.js` → Helmet → CORS allowlist (credentials) → cookie‑parser → rate‑limit → JSON parser → routes.
- Auth routes (`/api/auth`): login sets `httpOnly` cookie `token`; logout clears it; `me` verifies.
- Location routes (`/api/locations`): public reads; writes guarded by `requireAuth` middleware (JWT cookie → `req.user`).

## Auth design
- Single admin: email/password hash from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`).
- JWT stored in `httpOnly` cookie (`secure` in prod, `sameSite: 'none'` for cross‑origin).
- `requireAuth` middleware reads cookie, verifies, attaches payload.

## Data model
- `Location` schema (Mongoose): name, address, coordinates `[lng, lat]`, optional fields, and `Map` fields for `hours`, `drinks`, `food`, `specials`.
- Controller sanitizes/whitelists fields, validates coordinates, blocks unsafe Map keys (`.` or `$`).

## API surface
- `GET /health`
- `POST/GET /api/auth/login|logout|me`
- `GET /api/locations` (public)
- `GET/POST/PUT/DELETE /api/locations/:id` (writes require auth)

## Env vars
- Client: `REACT_APP_SERVER_URL`, `REACT_APP_MAPBOX_ACCESS_TOKEN`.
- Server: `PORT`, `NODE_ENV`, `MONGO_URI`, `CORS_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`.

## Local dev
- Server: `npm run dev` → nodemon on :8080.
- Client: `npm start` → CRA on :3000.

## Deploy (as documented)
- Frontend → Netlify (SPA redirects via `netlify.toml`).
- Backend → Render (Node, env vars, CORS set to Netlify origin).

## Tradeoffs / next steps
- Replace env‑based single admin with a `User` collection and RBAC.
- Add proper “business owner” auth (currently UI‑only).
- Centralize API client, add pagination, structured logs.

## 30‑second pitch
> VanSippy is a MERN app: React SPA shows a Mapbox map and venue list; Express API serves location data from MongoDB. Public reads are open; admin CRUD is protected by an HTTP‑only cookie JWT. The server uses Helmet, CORS allowlist, and rate limiting. Protected routes check `GET /api/auth/me` before rendering admin pages.
