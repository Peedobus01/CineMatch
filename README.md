# CineMatch – Personalized Movie Discovery Platform

MERN stack app that uses TMDB as the movie data source, with all recommendation,
personalization, ratings, and filtering logic built on top.

## Project status
- [x] Phase 1 — Project setup
- [x] Phase 2 — Backend foundation (Express, MongoDB, JWT auth, register/login)
- [x] Phase 3 — Frontend authentication (Vite + React + Tailwind, Login/Register, AuthContext, JWT storage, protected routes, Navbar)
- [x] Phase 4 (partial) — TMDB service layer + homepage endpoints (trending/popular/top-rated/now-playing/genres), in-memory caching, person search. Frontend homepage sections still pending.
- [ ] Phase 5 — Discovery/filter system + ranking
- [ ] Phase 6 — Watchlist, recently viewed, ratings, reviews, community rating, profile
- [ ] Phase 7 — Recommendation engine
- [ ] Phase 8 — Polish
- [ ] Phase 9 — Deployment

## 1. Getting a TMDB API key (free, takes ~5 minutes)
1. Create an account at https://www.themoviedb.org/signup
2. Once logged in, go to Settings → API (https://www.themoviedb.org/settings/api)
3. Click "Create" / "Request an API key" → choose "Developer" → fill in the short form
   (you can put "Student project / portfolio" as the use case)
4. Copy the **API Key (v3 auth)** — that's the value you'll paste into `.env`

## 2. Opening this project in VS Code
1. Unzip the project and open the `CineMatch` folder in VS Code (`File > Open Folder`)
2. Open two integrated terminals (`` Ctrl+` ``, then split) — one for backend, one for frontend later

## 3. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Then open `.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string (Atlas → Database → Connect → Drivers)
- `JWT_SECRET` — any long random string (e.g. generate one with `openssl rand -base64 32`)
- `TMDB_API_KEY` — the key from step 1

Run the dev server:
```bash
npm run dev
```
You should see `MongoDB connected` and `CineMatch backend running ... on port 5000` in the terminal.

Sanity check in your browser or via curl:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/movies/trending
```

## 4. Frontend setup
Open a second terminal (keep the backend running in the first one):
```bash
cd frontend
npm install
npm run dev
```
Vite will start on `http://localhost:5173`. It's already configured to proxy any
`/api/...` request to your backend on port 5000 (see `vite.config.js`), so you
don't need CORS workarounds or a `.env` file for local dev.

Open `http://localhost:5173/register`, create an account, and you should land
on the (currently placeholder) Home page while logged in. Refreshing the page
should keep you logged in — the token is stored in `localStorage` and verified
against `/api/auth/me` on load.

## 5. Recommended VS Code extensions
- ESLint
- Prettier
- MongoDB for VS Code (lets you browse your Atlas data without leaving the editor)
- Thunder Client or REST Client (for testing API routes without Postman)

## 6. What's already working right now
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (JWT-protected)
- `GET /api/movies/trending`, `/popular`, `/top-rated`, `/now-playing`, `/genres`
- `GET /api/movies/people/search?name=` — person lookup for director/actor filters
- `GET /api/movies/:tmdbId` — full movie details incl. cast/crew
- Frontend: `/register`, `/login`, JWT persisted in `localStorage`, session
  re-verified against `/api/auth/me` on page load, protected routes redirect
  to `/login` if logged out, Navbar reflects auth state

## 7. Next up
Phase 5 — the Discover page (structured filter UI) and the backend filtering +
ranking logic that scores TMDB results using genre/director/actor/rating weights.
