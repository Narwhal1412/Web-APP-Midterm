# Commit plan (frontend) – mapped to the rubric

Covers **Core Functionality (2.0)**, **UI/UX (0.5)**, **Git history and video (1.0)** and your **Live Defense (4.0)**.
Commit over several days as you really work. Do not run them all at once and do not fake dates.
Commits in the middle will not build; the full app runs after the last one.

```bash
# 1
git add package.json vite.config.js index.html .gitignore .env.example
git commit -m "chore: init Vite + React project"

# 2  measuring requests, auth header, cache HIT/MISS
git add src/api/client.js src/utils/format.js src/lib/requestLog.js
git commit -m "feat(api): fetch client with auth, latency and cache hit/miss"

# 3  register / login / logout
git add src/hooks/useAuth.js src/components/AuthPanel.jsx
git commit -m "feat(auth): register, login, logout"

# 4  notes CRUD + cache badge
git add src/components/NotesPanel.jsx
git commit -m "feat(notes): CRUD with Redis hit/miss badge"

# 5  health polling
git add src/utils/health.js src/hooks/useHealthMonitor.js
git commit -m "feat(health): polling with up/degraded/down detection"

# 6  status view + check button + banner
git add src/components/ServiceCard.jsx src/components/StatusPanel.jsx src/components/RebootBanner.jsx
git commit -m "feat(ui): status cards, check button and reboot banner"

# 7  outage experiment
git add src/components/OutagePanel.jsx src/utils/csv.js
git commit -m "feat: outage timeline with downtime and CSV export"

# 8
git add src/components/RequestLog.jsx
git commit -m "feat(ui): request log with CSV export"

# 9
git add src/App.jsx src/main.jsx
git commit -m "feat(ui): dashboard layout"

# 10  UI/UX
git add src/styles.css
git commit -m "style: responsive dark theme and accessible states"

# 11  Docker experiment: baseline
git add Dockerfile.standard .dockerignore
git commit -m "build: single-stage Dockerfile (baseline)"

# 12  Docker experiment: optimised
git add Dockerfile nginx.conf
git commit -m "build: multi-stage Dockerfile and nginx with DNS re-resolve"

# 13
git add scripts/benchmark-images.sh
git commit -m "test: script to benchmark image size and build time"

# 14
git add README.md docs/ai-log.md
git commit -m "docs: README and AI usage log"
```

## Be ready to explain at the Live Defense (no AI)

- How `useHealthMonitor` tells up / degraded / down apart, and why precision is about 1 s.
- Where the token is stored and sent (`api/client.js`), and what happens on a 401.
- How HIT / MISS is read (header `X-Cache`) and why a write must clear the cache.
- Why `nginx.conf` uses `resolver` and a variable in `proxy_pass`.
- Why the multi-stage image is smaller and where `Dockerfile.standard` is wasteful.
- Be able to change something small live, for example the polling interval or the banner text.
