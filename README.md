---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later, and npm
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account
- A free [TMDB](https://www.themoviedb.org/) account
- A free [Google AI Studio](https://aistudio.google.com/apikey) account (optional — the app works without this, just without AI-generated explanations)
- Git

---

## 1. Clone the repository

```bash
git clone <your-repo-url>
cd CineMatch
```

---

## 2. Get your API keys

### MongoDB Atlas (database)
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Once your cluster is ready, create a database user (Database Access) and note the username/password
3. Go to Database → Connect → Drivers → copy the connection string
4. Replace `<password>` with your database user's actual password, and add a database name (e.g. `/cinematch`) right before the `?` in the URL
5. Under Network Access, allow your current IP (or `0.0.0.0/0` for local dev simplicity)

### TMDB (movie data)
1. Sign up at [themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Go to Settings → API → Request/Create an API key (choose "Developer," any reasonable use-case description works)
3. Copy the **API Key (v3 auth)** value

### Gemini (optional — AI-generated recommendation explanations)
1. Sign in at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) with a Google account
2. Create an API key — no billing setup needed for the Flash/Flash-Lite models
3. If you ever hit a free-tier quota limit and recommendations seem to lose their AI-written explanations, check which models your key can access at:
   `https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY`
   and swap the `GEMINI_MODEL` value in `.env` to another available model. The app degrades gracefully either way — recommendations still work without Gemini, just with simpler auto-generated explanations.

---

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open the new `.env` file and fill in your real values:

```dotenv
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=7d

TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-lite-latest

CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```
You should see `MongoDB connected` followed by `CineMatch backend running... on port 5000`. If either line is missing, double-check the corresponding `.env` value.

Quick sanity check in a separate terminal:
```bash
curl http://localhost:5000/api/health
```

---

## 4. Frontend setup

Open a **second terminal** (leave the backend running in the first one):
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. Vite automatically proxies
all `/api/...` requests to the backend on port 5000, so no CORS setup or
extra `.env` file is needed for local development.

---

## 5. Using the app

1. Register an account (or log in if you already have one)
2. Browse **Home** and **Discover**, or open any movie's details page to
   rate it and add it to your watchlist
3. Once you've rated 3 or more movies, visit **For You** for personalized
   recommendations — or type a specific request like *"a dark thriller
   crime movie like Se7en"* or *"a high-octane superhero movie like Batman
   Begins"*
4. Check your **Profile** page for stats and taste charts

---

## Available scripts

**Backend** (run from `/backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restarts on file changes) |
| `npm start` | Start normally, no auto-restart |

**Frontend** (run from `/frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build, output to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Notes & known limitations

- Movie metadata is never duplicated locally — TMDB is the single source of
  truth for all movie data. Only ratings, watchlist entries, recently-viewed
  history, and derived preferences live in your MongoDB database.
- The recommendation engine's rating-based profile only drives the
  **no-query** "For You" view. An explicit search request intentionally
  ignores your rating history so results aren't biased toward your usual
  taste when you're deliberately asking for something different.
- Gemini's free tier has daily request quotas that vary by model; if
  recommendations unexpectedly show generic explanations instead of
  personalized ones, this is usually why — check the backend terminal log
  for the exact reason (it logs the specific failure every time).
- Reference-title matching (e.g. "like Interstellar") depends on TMDB's own
  `/similar` and `/recommendations` endpoints, which aren't perfect — very
  obscure or unusually stylized titles can occasionally be mismatched.

---

## Tech notes worth knowing (useful for interviews / code review)

- **Two-stage ranking**: the backend computes its own Bayesian-weighted
  rating + popularity score to rank TMDB results, rather than relying on
  TMDB's default single-field sort.
- **Incremental community rating**: updates in O(1) per new rating via a
  running sum/count on a lightweight `MovieStats` document — no aggregation
  query needed on read.
- **Recency-weighted preferences**: recommendation generation (separate from
  the lifetime stats shown on the Profile page) applies exponential decay to
  older ratings, so recent taste shifts matter more than a rating from a
  year ago.
- **LLM as a second-stage reranker, not the recommender**: candidate movies
  always come from the backend's own deterministic logic first; the LLM
  only reorders and explains a shortlist it is not permitted to deviate
  from, and the app remains fully functional if the LLM call fails, times
  out, or hits a quota limit.