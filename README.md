# Adani CIMAP — OSINT Intelligence Dashboard

Real-time **Corporate Intelligence · Monitor · Assess · Predict** command-center for executives, analysts and PR teams monitoring public perception, risks and emerging threats across social media, news and digital ecosystems.

---

## 1. Overview

CIMAP is a frontend-heavy React dashboard (with a thin FastAPI proxy for AI fallback) that:

- Streams live posts + HIGH_RISK alerts via WebSocket
- Aggregates signals into Risk Dials per Category and per Venture (speedometer gauges)
- Drills down: Venture → Site → Category → Sub-category → Severity → State → Platform
- Ships with 620-record mock fallback, so every demo runs even when the backend is offline
- Integrates a floating AI Analyst (Gemini 1.5 Pro primary, Emergent LLM Claude Sonnet 4.5 fallback, optional local **Ollama** LLM)
- Renders a Leaflet map with severity pins, heatmap overlay and state-level summary
- Surfaces Executive Briefing + Recommended Actions as compact popovers in the header row

---

## 2. Feature Matrix

| Surface | Highlights |
|---|---|
| Live Ticker | 200 s marquee, pause-on-hover, click-through to Post Detail, HIGH_RISK pulsing |
| Unified Insight Row | Severity distribution bar (clickable segments → filtered drawer), 6 KPIs (all clickable), Briefing + Actions popovers |
| Overview | Risk Dial · By Category + Risk Dial · By Venture (speedometer gauges), Hierarchical tree |
| Detail Drawer | Signal tree, velocity sparkline, narrative themes, top amplifiers, platform amplification, geographic spread |
| Geospatial Map | Leaflet (CARTO light) + severity pins + **leaflet.heat** heatmap toggle + state summary + emerging-hotspot strip |
| Analysis | Risk Concentration (Pareto), Sentiment × Risk Quadrant, Emerging Hotspots, Category × State heatmap, venture breakdown, top-10 sites, risk index gauge, volume trend |
| Live Feed | 3-column (Negative / Neutral / Positive) post cards, cursor-following hover preview with auto-play `<video>` loop or ken-burns image |
| Post Detail | 4 gauges (Risk / Sentiment / Virality / Influence), reach/shares/narrative-age, site sentiment trajectory, similar-signals frequency, recommended actions |
| AI Analyst | Floating glass panel; calls `/chat/analyst` then local `/api/ai/chat` → Emergent LLM or Ollama |

---

## 3. Architecture

```
┌──────────────────────────────────────────┐        ┌───────────────────────────┐
│            React frontend                │ HTTPS  │ External CIMAP backend     │
│  (Shadcn · Tailwind · Recharts · Leaflet)│◀──────▶│ https://adani-backend-     │
│                                          │        │   h3ij.onrender.com/api   │
└──────────┬───────────────────────────────┘        └───────────────────────────┘
           │                                                    ▲
           │  websocket ────────────────────────────────────────┘
           │     wss://…/ws/dashboard     (NEW_POSTS, HIGH_RISK_ALERT)
           ▼
┌──────────────────────────────────────────┐
│       Local FastAPI proxy (/app/backend) │
│   /api/ai/chat → falls back to:         │
│     1. Emergent LLM (Claude Sonnet 4.5) │
│     2. (optional) Ollama on :11434      │
└──────────────────────────────────────────┘
```

If the external backend is unreachable the frontend transparently falls back to a seeded **620-post** mock dataset (same shapes, same filter predicates).

---

## 4. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React-Router 7, Tailwind CSS, Shadcn UI, Recharts 3, React-Leaflet 5, leaflet.heat, lucide-react, sonner |
| Backend proxy | FastAPI, httpx, pydantic, emergentintegrations |
| AI | Emergent LLM (Claude Sonnet 4.5), optional Ollama |
| Realtime | Native WebSocket with mock-fallback timer |
| Tooling | Yarn (pinned), Supervisor, ESLint, Ruff |

---

## 5. Prerequisites

- **Node.js ≥ 18** (LTS recommended)
- **Yarn 1.x** (`npm i -g yarn`)
- **Python ≥ 3.11**
- **MongoDB ≥ 6** (the proxy uses a Mongo URL but does not write by default — required only if you enable persistence)
- **Git**
- _Optional_ **Ollama** ≥ 0.1.40 for a fully-local LLM fallback

---

## 6. Environment Variables

### `frontend/.env`

| Variable | Required | Example | Description |
|---|---|---|---|
| `REACT_APP_BACKEND_URL` | ✅ | `http://localhost:8001` | Base URL of the local FastAPI proxy (used only for `/api/ai/chat`) |
| `REACT_APP_API_URL` | ✅ | `https://adani-backend-h3ij.onrender.com/api` | External CIMAP REST base URL |
| `REACT_APP_WS_URL` | ✅ | `wss://adani-backend-h3ij.onrender.com/ws/dashboard` | External WebSocket URL |
| `WDS_SOCKET_PORT` | opt | `443` | CRA dev-server reload over HTTPS tunnels |

### `backend/.env`

| Variable | Required | Example | Description |
|---|---|---|---|
| `MONGO_URL` | ✅ | `mongodb://localhost:27017` | MongoDB connection string |
| `DB_NAME` | ✅ | `cimap` | Database name |
| `CORS_ORIGINS` | ✅ | `*` | Comma-separated CORS allow-list |
| `EMERGENT_LLM_KEY` | ✅ (for AI fallback) | `sk-emergent-…` | Universal key for Claude / Gemini fallback |
| `EXTERNAL_API_URL` | opt | `https://adani-backend-h3ij.onrender.com/api` | Override the upstream CIMAP API |
| `OLLAMA_URL` | opt | `http://localhost:11434` | Enables local Ollama fallback |
| `OLLAMA_MODEL` | opt | `llama3.1:8b` | Ollama model tag to query |

Never commit `.env` files — both folders include one via `.gitignore`.

---

## 7. Local Installation

### 7.1 Linux / macOS

```bash
# 1. Clone
git clone <repo-url> cimap && cd cimap

# 2. Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
cp .env.sample .env     # then edit
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 3. Frontend (new terminal)
cd ../frontend
cp .env.sample .env     # then edit
yarn
yarn start              # http://localhost:3000

# 4. (Optional) start MongoDB
sudo systemctl start mongod
```

### 7.2 Windows (PowerShell)

```powershell
# 1. Clone
git clone <repo-url> cimap
cd cimap

# 2. Backend
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
copy .env.sample .env    # then edit with notepad .env
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 3. Frontend (new PowerShell)
cd ..\frontend
copy .env.sample .env
yarn
yarn start
```

MongoDB on Windows: install MongoDB Community Edition; it auto-starts as a service.

### 7.3 Verify

- Open http://localhost:3000 — should redirect to `/login`
- Click **Continue in Demo Mode** → dashboard loads in under 3 s
- Try filters, severity-bar clicks, map heatmap toggle, AI Analyst chat

---

## 8. API Reference (external CIMAP backend)

Base URL: `https://adani-backend-h3ij.onrender.com/api`
All authenticated endpoints require `Authorization: Bearer <JWT>`.

### 8.1 Auth

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| GET  | `/auth/me` | — | `User` |

### 8.2 KPIs & Posts

| Method | Path | Query | Notes |
|---|---|---|---|
| GET | `/kpis` | filters | Aggregate signal counts |
| GET | `/posts` | `severity,venture,category,subcategory,state,platform,q,start,end,limit,skip` | Paginated post list |
| GET | `/posts/live` | `limit` | Most-recent posts for live feed |
| GET | `/posts/{id}` | — | Single post |
| GET | `/posts/export` | filters + `format=csv` | CSV download |

### 8.3 Intelligence

| Method | Path | Notes |
|---|---|---|
| GET | `/locations` | States + sites with aggregated risk |
| GET | `/hierarchy` | Venture → Site → Category → Sub-point tree |
| GET | `/platform-distribution` | Posts by platform |
| GET | `/activity-distribution` | Category distribution (used for Category Risk Dial) |
| GET | `/sentiment-trend` | `bucket=day \| hour` |
| GET | `/reports/severity` | Severity distribution breakdown |
| GET | `/reports/area` | State-level breakdown (backs State Summary + venture breakdown) |
| GET | `/reports/categories` | All category labels |

### 8.4 AI Analyst

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/chat/analyst` | `{ message, session_id }` | Gemini 1.5 Pro RAG chat |

### 8.5 Local proxy (`/app/backend`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/` | Health |
| POST | `/api/ai/chat` | Tries external `/chat/analyst`; falls back to Emergent LLM Claude Sonnet 4.5; optionally Ollama (see §10) |

### 8.6 WebSocket events

`wss://adani-backend-h3ij.onrender.com/ws/dashboard`

| Event | Payload |
|---|---|
| `NEW_POSTS` | `Post[]` — new or updated posts |
| `HIGH_RISK_ALERT` | `Post` — single post tagged critical |
| `MULTI_HIGH_RISK_ALERT` | `{ posts: Post[] }` — correlated burst |

Mock fallback emits one event every ~4 s when the socket cannot connect.

---

## 9. Database Schema (reference)

The proxy does **not** write to Mongo by default. Schema below describes the external CIMAP data model and the shape the frontend expects.

### `users`

```ts
{
  _id:          ObjectId,
  email:        string,       // unique
  password:     string,       // bcrypt
  name:         string,
  role:         "executive" | "analyst" | "pr",
  last_login:   Date,
  created_at:   Date
}
```

### `posts`  (the core signal collection)

```ts
{
  _id:               ObjectId,
  id:                string,   // external id
  content:           string,
  author:            string,
  handle:            string,
  author_followers:  number,
  platform:          "twitter" | "instagram" | "facebook" | "reddit" | "linkedin" | "news",
  severity:          "critical" | "high" | "medium" | "low",
  venture:           string,
  site:              string,
  state:             string,
  category:          string,
  subcategory:       string,
  sentiment:         number,   // -1..1
  risk_score:        number,   // 0..1
  shares:            number,
  reach:             number,
  has_image:         boolean,
  has_video:         boolean,
  image_url:         string?,
  video_url:         string?,
  url:               string,
  timestamp:         Date
}
// Indexes
db.posts.createIndex({ timestamp: -1 })
db.posts.createIndex({ severity: 1, timestamp: -1 })
db.posts.createIndex({ venture: 1, state: 1, category: 1 })
db.posts.createIndex({ content: "text", author: "text", site: "text" })
```

### `sites`

```ts
{ _id, name, venture, state, lat, lng, created_at }
```

### `ventures`

```ts
{ _id, name, sector, country, created_at }
```

### `alerts` (for HIGH_RISK history)

```ts
{ _id, post_id, severity, delivered_to: string[], created_at }
```

### `chat_sessions` (AI analyst memory)

```ts
{ _id, user_id, session_id, messages: [{role, text, ts}], created_at }
```

---

## 10. Local AI — attaching Ollama

1. Install Ollama and pull a model:

   ```bash
   # macOS / Linux
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull llama3.1:8b     # or mistral, qwen2.5, phi3, …
   ollama serve                # listens on http://localhost:11434
   ```

   On Windows: download the installer from https://ollama.com and run it — it registers as a service.

2. Extend `backend/.env`:

   ```env
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1:8b
   ```

3. Patch the chat fallback chain (already scaffolded — see `backend/server.py → ai_chat`). The order becomes:

   ```
   1. External /chat/analyst (Gemini 1.5 Pro)
   2. Ollama (if OLLAMA_URL set)
   3. Emergent LLM (Claude Sonnet 4.5)
   ```

4. Restart the backend. The AI Analyst panel will automatically use Ollama offline.

### Why Ollama?

- **Zero data egress** — signals and executive prompts never leave the machine
- Hardware-accelerated on Apple Silicon (Metal), NVIDIA (CUDA), and AMD (ROCm)
- Swap models without redeploying — `ollama run mistral` / `qwen2.5:14b` etc.

---

## 11. Hardware Requirements

### Dashboard-only (no local LLM)

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 cores (x86-64 or ARM64) | 4 cores |
| RAM | 4 GB | 8 GB |
| Disk | 2 GB | 5 GB (logs + Mongo) |
| Network | 1 Mbps for live WS | 10 Mbps |

### With Ollama local LLM

| Model | RAM | GPU VRAM | Notes |
|---|---|---|---|
| `phi3:3.8b` | 8 GB | 4 GB | Lightweight |
| `llama3.1:8b` | 16 GB | 8 GB | Balanced quality |
| `mistral:7b` | 16 GB | 8 GB | Fast throughput |
| `qwen2.5:14b` | 24 GB | 12 GB | Higher accuracy |
| `llama3.1:70b` | 64 GB | 48 GB (2×24 GB) | Executive-grade only |

Without a GPU, Ollama will run CPU-only with noticeably slower responses — still usable for the 2-3 prompts/min typical of an executive dashboard.

---

## 12. Troubleshooting

| Symptom | Fix |
|---|---|
| Dashboard shows `DEMO` chip | External backend unreachable — mock fallback active. Verify `REACT_APP_API_URL` and network egress |
| WebSocket not green | `wss://…/ws/dashboard` blocked; mock ticker kicks in automatically |
| AI Analyst replies "unavailable" | Check `EMERGENT_LLM_KEY` / `OLLAMA_URL`; view `uvicorn` logs |
| `yarn start` fails with OpenSSL errors | `export NODE_OPTIONS=--openssl-legacy-provider` |
| Leaflet tiles missing | Firewall blocks `basemaps.cartocdn.com` — switch to OSM in `LeafletMap.jsx` |
| Map covers drawer | Handled via `.leaflet-pane { z-index: 1 !important }` in `index.css`; do not remove |

---

## 13. Project Layout

```
/app
├── backend/                 FastAPI proxy
│   ├── server.py            /api/ai/chat + CORS + health
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.js
│       ├── contexts/        AuthContext, AppContext (filters, WS, data)
│       ├── lib/             api.js, websocket.js, mockData.js (620-post seed)
│       ├── pages/           Login.jsx, Dashboard.jsx
│       └── components/
│           ├── shell/       LiveSignalTicker, UnifiedInsightRow, FiltersRow, NavigationRow, DashboardShell
│           ├── overview/    OverviewTab, RiskDialGauge (speedometer), HierarchyTree, DetailDrawer
│           ├── map/         GeoMapTab, LeafletMap (heatmap), StateSummaryTable
│           ├── analysis/    AnalysisTab (Pareto, Quadrant, Hotspots, Heatmap)
│           ├── feed/        LiveFeedTab, PostCard, PostDetailDialog
│           ├── ai/          AIAnalystPanel, FloatingInsights (Briefing + Actions popovers)
│           └── shared/      SeverityBar, HierarchyCrumb
├── memory/
│   ├── PRD.md
│   └── test_credentials.md
└── README.md                ← this file
```

---

## 14. License

Proprietary / internal. © Adani CIMAP team.
