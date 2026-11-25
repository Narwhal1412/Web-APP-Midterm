# Docker Stack Monitor – Frontend

Small frontend for the Docker (Containerization) midterm. It covers the agreed "app done" list:
register / login / logout, notes CRUD (own notes only), visible Redis cache HIT / MISS on the notes list,
a status view backed by `/api/health`, and a "Check health" button. When the server is down or unhealthy
it shows: **ATTENTION: SERVER's REBOOTING, please wait shortly.**

## Run

```bash
npm install
cp .env.example .env     # VITE_BACKEND = where the API runs (default http://localhost:8000)
                         # VITE_API_BASE = base path the browser calls (default /api)
npm run dev              # http://localhost:5173
```

All requests use relative URLs (`/api/...`). In dev, Vite proxies them; in Docker, nginx does.

## API the backend must provide (agree this with the backend member)

Auth is a bearer token: `Authorization: Bearer <token>`. Errors: `{ "message": "..." }`.

| Method | Endpoint | Auth | Request body | Success response |
|---|---|---|---|---|
| POST | `/api/register` | No | `{name, email, password}` | `{token, user}` |
| POST | `/api/login` | No | `{email, password}` | `{token, user}` |
| POST | `/api/logout` | Yes | – | 200/204 |
| GET | `/api/user` | Yes | – | the user (`{name, email, ...}`, plain or inside `data`) |
| GET | `/api/notes` | Yes | – | list of the user's notes (array or `{data:[...]}`) |
| POST | `/api/notes` | Yes | `{title, content}` | created note |
| GET | `/api/notes/:id` | Yes | – | one note |
| PUT | `/api/notes/:id` | Yes | `{title, content}` | updated note |
| DELETE | `/api/notes/:id` | Yes | – | 204 |
| GET | `/api/health` | No | – | **200** healthy, **503** if the database or Redis is down |

**Cache HIT / MISS:** the backend should send the header `X-Cache: HIT` or `X-Cache: MISS` on `GET /api/notes`
(a JSON field `cache` or `source` also works). Creating, updating or deleting a note must clear the cached list,
so the next list request is a MISS and the following ones are HITs.

**Health body.** Agreed so far: `200 {"db":"ok","container":"ID"}` and `503 {"db":"down","container":"ID"}`. Please add `"redis":"ok"` / `"down"` too. Other shapes also work, for example `{"database":"up","redis":"up"}` or
`{"checks":{"database":{"status":"up"},"redis":{"status":"down"}}}`. Optional `uptime_s`.
Return the same body with status 503 when something is down, so the page can say which one.

## What the frontend shows

- **Banner** at the top when `/api/health` does not return 200, or does not answer at all.
- **Service status**: Web/API, Database, Redis. "Check health" calls `GET /api/health` once and prints status code and time.
- **Notes**: create, edit, delete, refresh. A badge shows HIT or MISS and the measured time of the last list request.
  "Run 20 list requests" gives a small table (count, average, min, max per HIT / MISS) for the report.
- **Outage timeline**: when the server goes down and how long until it is back (about +/- 5 s, health is polled every 5 s). Cause an outage with
  `docker compose kill backend`, then check `docker compose logs backend` and `docker compose ps`.

## Docker

```bash
docker build -t notes-fe:multi -f Dockerfile .              # multi-stage, nginx (use this one)
docker build -t notes-fe:standard -f Dockerfile.standard .  # single-stage baseline for the comparison
bash scripts/benchmark-images.sh                            # 3 builds each -> benchmark/image-build.csv
```

```yaml
# docker-compose.yml (frontend part)
frontend:
  build: ./frontend
  ports: ["8080:80"]
  depends_on: [backend]
  restart: unless-stopped
```

`nginx.conf` forwards `/api` to the service named `backend` on port 8000. Rename it there if your compose service differs.
It re-resolves the name every 5 s, so nginx still reaches the backend after a restart gives it a new IP.

## Structure

```
src/api/        fetch wrapper: auth header, latency, cache HIT/MISS
src/hooks/      useHealthMonitor (up / degraded / down + downtime), useAuth
src/components/ RebootBanner, StatusPanel, AuthPanel, NotesPanel, OutagePanel
Dockerfile, Dockerfile.standard, nginx.conf, scripts/
```

## Run without the real backend (mock)

```bash
node mock-backend/server.cjs          # terminal 1: API on http://localhost:8000 (demo@example.com / password123)
npm run dev                           # terminal 2: http://localhost:5173
# or everything in Docker:  docker compose -f docker-compose.mock.yml up --build   -> http://localhost:8080
```
Test the banner: `curl -X POST localhost:8000/api/_debug/db-down` (health returns 503), then `.../db-up`.
