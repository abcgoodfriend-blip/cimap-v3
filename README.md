# Adani CIMAP — OSINT Intelligence Dashboard

Real-time **Corporate Intelligence · Monitor · Assess · Predict** command-center for executives, analysts and PR teams monitoring public perception, risks and emerging threats across social media, news and digital ecosystems.

---

## Table of Contents
1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Prerequisites](#4-prerequisites)
5. [Environment Variables](#5-environment-variables)
6. [Local Installation](#6-local-installation)
7. [API Reference](#7-api-reference)
8. [WebSocket Events](#8-websocket-events)
9. [Database Schema](#9-database-schema)
10. [Local AI — Ollama](#10-local-ai--ollama)
11. [Hardware Requirements](#11-hardware-requirements)
12. [Component Reference (detailed)](#12-component-reference)
13. [Data Flow](#13-data-flow)
14. [Styling & Design Tokens](#14-styling--design-tokens)
15. [Troubleshooting](#15-troubleshooting)
16. [Project Layout](#16-project-layout)

---

## 1. Overview

CIMAP is a frontend-heavy React dashboard (with a thin FastAPI proxy for AI fallback) that:

- Streams live posts + `HIGH_RISK_ALERT` events via WebSocket
- Aggregates signals into **Risk Dials per Category** and **per Venture** (4-colour speedometer gauges)
- Drills down: **Venture → Site → Category → Sub-category → Severity → State → Platform**
- Ships with a seeded **620-post** mock fallback so every demo runs even when the backend is offline
- Integrates a floating **AI Analyst** (Gemini 1.5 Pro primary, Emergent LLM Claude Sonnet 4.5 fallback, optional local **Ollama**)
- Renders a Leaflet map with severity pins, `leaflet.heat` heatmap overlay, and state-level summary
- Surfaces **Executive Briefing** + **Recommended Actions** as compact popovers in the header row
- Every DetailDrawer computes 6 **decision-grade** metrics (Total Reach, Unique Voices, Amplification, Risk-Trend 7d vs 30d, Peak Hour, Coordination Score) and flags Legal/Financial/Board-escalation risk chips

---

## 2. Architecture

```
┌──────────────────────────────────────────┐         ┌───────────────────────────┐
│            React frontend                │  HTTPS  │ External CIMAP backend    │
│  (Shadcn · Tailwind · Recharts · Leaflet)│◀───────▶│  https://adani-backend-   │
│                                          │         │    h3ij.onrender.com/api  │
└──────────┬───────────────────────────────┘         └───────────────────────────┘
           │                                                      ▲
           │  WebSocket ──────────────────────────────────────────┘
           │    wss://…/ws/dashboard   (NEW_POSTS, HIGH_RISK_ALERT)
           ▼
┌──────────────────────────────────────────┐
│      Local FastAPI proxy (/app/backend)  │
│   /api/ai/chat ─── fallback chain:      │
│     1. External /chat/analyst (Gemini)  │
│     2. (optional) Ollama on :11434      │
│     3. Emergent LLM (Claude Sonnet 4.5) │
└──────────────────────────────────────────┘
```

If the external backend is unreachable the frontend transparently falls back to a seeded **620-post** mock dataset (same shapes, same filter predicates).

---

## 3. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React-Router 7, Tailwind CSS, Shadcn UI, Recharts 3, React-Leaflet 5, `leaflet.heat`, lucide-react, sonner |
| Backend proxy | FastAPI, httpx, pydantic, emergentintegrations |
| AI | Emergent Universal LLM key (Claude Sonnet 4.5), optional Ollama |
| Realtime | Native WebSocket with mock-fallback timer |
| Tooling | Yarn 1.x, Supervisor, ESLint, Ruff |

---

## 4. Prerequisites

- **Node.js ≥ 18**
- **Yarn 1.x** (`npm i -g yarn`)
- **Python ≥ 3.11**
- **MongoDB ≥ 6** (required only if you enable persistence)
- **Git**
- _Optional_ **Ollama ≥ 0.1.40** for a fully-local LLM fallback

---

## 5. Environment Variables

### `frontend/.env`
| Variable | Required | Example | Description |
|---|---|---|---|
| `REACT_APP_BACKEND_URL` | ✅ | `http://localhost:8001` | Base URL of the local FastAPI proxy (used only for `/api/ai/chat`) |
| `REACT_APP_API_URL` | ✅ | `https://adani-backend-h3ij.onrender.com/api` | External CIMAP REST base URL |
| `REACT_APP_WS_URL` | ✅ | `wss://adani-backend-h3ij.onrender.com/ws/dashboard` | External WebSocket URL |
| `WDS_SOCKET_PORT` | optional | `443` | CRA dev-server over HTTPS tunnels |

### `backend/.env`
| Variable | Required | Example | Description |
|---|---|---|---|
| `MONGO_URL` | ✅ | `mongodb://localhost:27017` | MongoDB connection string |
| `DB_NAME` | ✅ | `cimap` | Database name |
| `CORS_ORIGINS` | ✅ | `*` | Comma-separated CORS allow-list |
| `EMERGENT_LLM_KEY` | ✅ (AI) | `sk-emergent-…` | Universal Claude/Gemini key |
| `EXTERNAL_API_URL` | optional | `https://adani-backend-h3ij.onrender.com/api` | Upstream CIMAP API |
| `OLLAMA_URL` | optional | `http://localhost:11434` | Enables local Ollama fallback |
| `OLLAMA_MODEL` | optional | `llama3.1:8b` | Ollama model tag to query |

---

## 6. Local Installation

### 6.1 Linux / macOS
```bash
git clone <repo-url> cimap && cd cimap

# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
cp .env.sample .env          # edit
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (new terminal)
cd ../frontend
cp .env.sample .env          # edit
yarn
yarn start                    # http://localhost:3000

# (Optional) MongoDB
sudo systemctl start mongod
```

### 6.2 Windows (PowerShell)
```powershell
git clone <repo-url> cimap
cd cimap

# Backend
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
copy .env.sample .env
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (new PowerShell)
cd ..\frontend
copy .env.sample .env
yarn
yarn start
```

### 6.3 Verify
1. Visit `http://localhost:3000` → redirects to `/login`
2. Click **Continue in Demo Mode**
3. Dashboard loads within 3 s with mock data
4. Try filters, severity-bar clicks, map heatmap toggle, AI Analyst chat

---

## 7. API Reference

Base URL: `https://adani-backend-h3ij.onrender.com/api`
All authenticated endpoints require `Authorization: Bearer <JWT>`.

### 7.1 Auth
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| GET  | `/auth/me`   | — | `User` |

### 7.2 KPIs & Posts
| Method | Path | Query | Notes |
|---|---|---|---|
| GET | `/kpis` | filters | Aggregate signal counts |
| GET | `/posts` | severity, venture, category, subcategory, state, platform, q, start, end, limit, skip | Paginated |
| GET | `/posts/live` | limit | Live-feed recent posts |
| GET | `/posts/{id}` | — | Single post |
| GET | `/posts/export` | filters + format=csv | CSV download |

### 7.3 Intelligence
| Method | Path | Notes |
|---|---|---|
| GET | `/locations` | States + sites with aggregated risk |
| GET | `/hierarchy` | Venture → Site → Category → Sub-point tree |
| GET | `/platform-distribution` | Posts per platform |
| GET | `/activity-distribution` | Category distribution (backs Category Risk Dial) |
| GET | `/sentiment-trend` | `bucket=day \| hour` |
| GET | `/reports/severity` | Severity distribution |
| GET | `/reports/area` | State-level breakdown |
| GET | `/reports/categories` | All category labels |

### 7.4 AI Analyst
| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/chat/analyst` | `{ message, session_id }` | Gemini 1.5 Pro RAG chat |

### 7.5 Local proxy (`/app/backend`)
| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/` | Health |
| POST | `/api/ai/chat` | Tries external → Emergent LLM → (optional) Ollama |

---

## 8. WebSocket Events

`wss://adani-backend-h3ij.onrender.com/ws/dashboard`

| Event | Payload |
|---|---|
| `NEW_POSTS` | `Post[]` — new/updated posts (appended to Live Feed + Ticker) |
| `HIGH_RISK_ALERT` | `Post` — triggers sonner toast + pulsing chip in ticker + bell badge |
| `MULTI_HIGH_RISK_ALERT` | `{ posts: Post[] }` — correlated burst |

Mock fallback emits one event every ~4 s when the socket cannot connect; `data-source-indicator` in the Navigation row switches to **DEMO**.

---

## 9. Database Schema

### `users`
```ts
{ _id, email, password /*bcrypt*/, name, role: "executive"|"analyst"|"pr", last_login, created_at }
```

### `posts` (core)
```ts
{
  _id, id, content, author, handle, author_followers,
  platform, severity, venture, site, state, category, subcategory,
  sentiment /*-1..1*/, risk_score /*0..1*/, shares, reach,
  has_image, has_video, image_url, video_url, url, timestamp
}
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

### `alerts`
```ts
{ _id, post_id, severity, delivered_to: string[], created_at }
```

### `chat_sessions`
```ts
{ _id, user_id, session_id, messages: [{ role, text, ts }], created_at }
```

---

## 10. Local AI — Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b
ollama serve
```

Extend `backend/.env`:
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

Fallback chain becomes: **external /chat/analyst → Ollama → Emergent LLM Claude**.

Why Ollama?
- Zero data egress — prompts never leave the machine
- GPU-accelerated on Apple Silicon (Metal), NVIDIA (CUDA), AMD (ROCm)
- Swap models without redeploy — `ollama run qwen2.5:14b`

---

## 11. Hardware Requirements

### Dashboard-only (no local LLM)
| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 cores (x86-64 / ARM64) | 4 cores |
| RAM | 4 GB | 8 GB |
| Disk | 2 GB | 5 GB |
| Network | 1 Mbps for WS | 10 Mbps |

### With Ollama local LLM
| Model | RAM | GPU VRAM |
|---|---|---|
| `phi3:3.8b` | 8 GB | 4 GB |
| `llama3.1:8b` | 16 GB | 8 GB |
| `mistral:7b` | 16 GB | 8 GB |
| `qwen2.5:14b` | 24 GB | 12 GB |
| `llama3.1:70b` | 64 GB | 48 GB (2×24 GB) |

CPU-only still works — acceptable for the 2-3 prompts/min pattern typical of an exec dashboard.

---

## 12. Component Reference

Every file is designed as a thin, single-responsibility React component. Layout is fully driven by Tailwind + CSS variables declared in `index.css`.

### 12.1 Backend

#### `backend/server.py`
The **thin FastAPI proxy**. Responsibilities:
- Expose `/api/` health endpoint.
- Expose `POST /api/ai/chat` that tries the upstream CIMAP `/chat/analyst` (with the caller's JWT if provided), falling back to Emergent LLM's Claude Sonnet 4.5 via `emergentintegrations.LlmChat`.
- Inject a system prompt framing Claude as an **OSINT Intelligence Analyst** so replies remain exec-grade.
- CORS allow-list sourced from `CORS_ORIGINS`.

Extending it for Ollama takes ~20 lines — README §10 documents the contract.

### 12.2 Frontend · Contexts

#### `src/contexts/AuthContext.jsx`
Holds `{ user, role, ready, login(), loginDemo(), logout(), switchRole() }`.
- `login()` hits the external `/auth/login`; on success stores JWT, user, role in `localStorage`.
- `loginDemo(role)` creates a mock session without any backend round-trip — ideal for offline demos.
- `switchRole(role)` updates the role in-memory and persists to `localStorage`; wired to the Role Switcher dropdown in `NavigationRow`.
- `Protected` route in `App.js` blocks `/` until `ready && user`.

#### `src/contexts/AppContext.jsx`
The **single source of truth for all dashboard data**. On mount and on every filter change it runs 12 parallel `safeFetch` calls for KPIs, posts, live posts, locations, hierarchy, severity, platform, category, venture distributions, venture breakdown, top sites, and sentiment trend. Every derived metric is re-computed from the filter predicate so that changing Venture/Category/Severity/State/Platform/Range updates the entire page.

Also owns:
- `activeTab` (overview/map/analysis/feed)
- `selectedDetail` (opens DetailDrawer)
- `selectedPost` (opens PostDetailDialog)
- WebSocket lifecycle (via `lib/websocket`) with auto-fallback to the mock stream
- Alerts list (fed from `HIGH_RISK_ALERT`), Ticker signals, `wsStatus`, and `source` (live/mock)
- `applyRolePreset()` for Executive / Analyst / PR filter defaults

### 12.3 Frontend · Library

#### `src/lib/api.js`
- `apiClient` — axios instance with Auth interceptor pulling JWT from `localStorage`.
- `safeFetch(path, { params, mockKey })` — the workhorse. Tries the external API; on ANY failure returns `{ data: mockData, source: "mock" }`. Keeps the dashboard populated in every environment.
- `loginExternal(email, password)` + `fetchMe()` for auth.
- `exportPosts(params)` — opens the CSV export endpoint with JWT query param in a new tab.
- `aiChat(message, sessionId)` — tries external `/chat/analyst` first, then the local `/api/ai/chat` (which uses Emergent LLM). Returns `{ response, source }`.

#### `src/lib/mockData.js`
Seeded 620-record generator. Produces:
- Reproducible posts (sine-based `seeded()` PRNG so snapshots are stable)
- 27 sites, 14 states, 8 ventures, 7 categories, 4-5 sub-categories each
- Rich post fields including `image_url`, `video_url`, `shares`, `reach`, `author_followers`

Exports a single `getMockData(key, params)` router that internally calls `applyFilters(posts, params)` so every derived metric (KPIs, hierarchy, locations, severity/platform/category/venture distributions, venture breakdown, top sites, sentiment trend) respects the filter bag.

Also exports `getAllPosts()` (unfiltered, used by severity tree + sentiment trajectory) and `mockWebSocketEvent()`.

#### `src/lib/websocket.js`
`connectDashboardWS({ onOpen, onClose, onMessage })` — native WebSocket wrapper. If the socket fails to open within 3.5 s it switches to a mock stream emitting `mockWebSocketEvent()` every 4 s. Reports `info.mock` flag so the UI can display a **DEMO STREAM** chip.

### 12.4 Frontend · Pages

#### `src/pages/Login.jsx`
Dual-panel login with:
- Left: CIMAP brand mark, live headline, system-status strip
- Right: email/password form that posts to the external backend, a **role selector** (executive/analyst/pr) and a **Continue in Demo Mode** button
- Grid-bg background animated with pure CSS

#### `src/pages/Dashboard.jsx`
Routes the active tab to one of four tab components, mounts the always-present overlays: `DetailDrawer`, `PostDetailDialog`, `AIAnalystPanel`.

### 12.5 Frontend · Shell (sticky header)

#### `shell/DashboardShell.jsx`
Sticky top-header wrapper containing the 4 header strips (Ticker → Unified Insight → Navigation → Filters) above the scrollable `<main>`.

#### `shell/LiveSignalTicker.jsx`
Horizontal marquee (200 s loop, `pause-on-hover`). Each signal is a clickable button opening the PostDetailDialog. HIGH_RISK items render in red with pulsing dots. A left-side badge shows connection status (`LIVE`, `DEMO STREAM`, `RECONNECTING`).

#### `shell/UnifiedInsightRow.jsx`
Two-column row:
- Left: `SeverityBar` (clickable segments & legend chips → severity drawer)
- Right: 8 equally-distributed cells — 6 clickable KPIs (Total / Critical / High Risk / Active Sites / Avg Sentiment / Posts 24h) + **Briefing** popover + **Actions** popover. No overflow scroll.

KPI click handlers:
| KPI | Action |
|---|---|
| Total / Critical | severity drawer (critical) |
| High Risk | severity drawer (high) |
| Active Sites | switches to Geospatial tab |
| Avg Sentiment | switches to Analysis tab |
| Posts (24h) | sets `window=24h` filter |

#### `shell/NavigationRow.jsx`
- CIMAP brand pill + data-source indicator (LIVE / DEMO)
- Tab strip (Overview / Geospatial Map / Analysis / Live Feed)
- Global search (writes to `filters.q`)
- **Export** button calling `/posts/export`
- Notifications popover showing recent alerts with pulsing indicator
- **Role Switcher** dropdown
- User menu with logout

#### `shell/FiltersRow.jsx`
Compact filter strip with labels ABOVE each control to save horizontal space. Fields: Venture, Category, Sub-category (dependent on Category), Severity, State, Platform, Range, Start/End dates. **Clear Filters** auto-appears when any filter is active.

### 12.6 Frontend · Overview tab

#### `overview/OverviewTab.jsx`
Two-column grid:
- Left (1.85fr): two panels — Risk Dial · By Category AND Risk Dial · By Venture
- Right (1fr): Hierarchical Tree

#### `overview/RiskDialGauge.jsx`
4-colour speedometer SVG (green → yellow → orange → red arcs) with a weighted needle, large legible risk index (0-100) and severity band badge. Clicking opens the DetailDrawer with type `category` or `venture`.

#### `overview/HierarchyTree.jsx`
Expandable 4-level tree: Venture → Site → Category → Sub-point. Each row shows a mini risk bar and critical/total count. Clicking any level opens the DetailDrawer scoped to that node.

#### `overview/DetailDrawer.jsx`
**The most information-dense component** — a Sheet (right-side drawer, `max-w-4xl`) with:

Header
- Type label + velocity delta (% 3d vs 4d)
- Full `HierarchyCrumb` (VEN → SITE → CAT → SUB → SEV → STATE → PLAT)
- 4 hero KPIs (Signals, Critical, Avg Risk, Avg Sentiment)

Body (scoped to the selected filter)
- SeverityBar
- **Executive Brief** strip (6 metrics): Total Reach, Unique Voices, Amplification, Risk-Trend 7d vs 30d, Peak Hour IST, Coordination Score ("likely campaign / mixed / organic")
- **Stakeholder Tiers** bar chart (Celebrity / Influencer / Activist / Grassroots) + auto-flag chips (LEGAL PROXIMITY, FINANCIAL EXPOSURE, BOARD-ESCALATION LIKELY)
- **Verbatim Signal Quotes** — top-3 most-amplified quotes, click-to-open post detail
- For `type === "severity"`: a full **Signal Tree** (Venture → Site → Sub-category) ordered by avg risk
- For `type === "category"`: **Sub-category mini speedometers** with risk index 0-100
- 14-day Signal Velocity line
- Sentiment Distribution mini-bar
- Narrative Themes (top sub-categories), Top Amplifiers (reach-ranked), Platform Amplification
- Top Critical Signals (risk-ranked, clickable)
- Geographic Spread (state-level critical bars)

### 12.7 Frontend · Geospatial tab

#### `map/GeoMapTab.jsx`
- **Emerging Hotspots** strip (6 states by 3d-vs-7d delta)
- Two-column grid: Leaflet map (660 px tall) + State Summary Table
- Map overlay controls: mode-toggle pill (**Pins / Heatmap / Both**), site/state counter, severity legend chip

#### `map/LeafletMap.jsx`
CartoDB Light tiles, severity-coloured `CircleMarker` pins (radius scales with signal count), hover tooltip + popup. **HeatLayer** via `leaflet.heat` with a gradient from low (green) → critical (red), weighted by `avg_risk × critical`. `z-index` override in CSS ensures the map sits BELOW overlays (Sheet / Dialog).

#### `map/StateSummaryTable.jsx`
Sorted by critical count. Rows: state, signals, critical, avg risk, sentiment (auto-coloured), with a **HOTSPOT** chip on the top entry. Click → state drawer.

### 12.8 Frontend · Analysis tab

`analysis/AnalysisTab.jsx` assembles 8 exec-grade visualizations:

1. **VentureBreakdown** — stacked severity bars per venture (critical/high/med/low colours)
2. **TopCriticalSites** — top-10 table with state, venture, signals, critical, avg risk, sentiment
3. **RiskIndexGauge** — composite 0-100 system indicator (STABLE / WATCH / ELEVATED / CRITICAL)
4. **VolumeTrend** — 30-day line of critical + total posts
5. **RiskConcentration (Pareto)** — composed chart: bar = critical per site, line = cumulative %, reference line at 80% with "80% from N sites" callout
6. **SentimentRiskQuadrant** — scatter of sites with four labelled quadrants (CRISIS, HIGH-RISK POSITIVE, GRUMBLING, HAPPY); crisis-zone count highlighted
7. **EmergingHotspots** — 6 states with 3d vs 7d velocity delta, rising/falling arrows
8. **CategoryStateHeatmap** — colour-graded matrix showing where categories × states concentrate

### 12.9 Frontend · Live Feed

#### `feed/LiveFeedTab.jsx`
Three-column sentiment layout: **Negative / Neutral / Positive** (`sentiment < -0.15`, `-0.15..0.15`, `> 0.15`). Platform-distribution badges at top + search box.

#### `feed/PostCard.jsx`
Compact card with severity dot, platform, state, author, sentiment, risk score. Hover triggers a **cursor-following portal preview** that auto-plays `<video>` loop (muted) or a ken-burns CSS-animated image plus Risk/Sentiment/Reach trio.

#### `feed/PostDetailDialog.jsx`
Widened to `max-w-5xl`. Contents:
- Full hierarchy breadcrumb
- 4 gauges (RISK / SENTIMENT / VIRALITY / INFLUENCE)
- Reach / Shares / Narrative-Age trio
- Content block with inline `<video>` or `<img>` if media is present
- **Sentiment Trajectory** line — 30 days for the same SITE
- **Similar Signals Frequency** line — 30 days for the same SUB-CATEGORY
- **Recommended Actions** panel (tactical suggestions derived from severity / category / reach / sentiment)
- Related Signals list

### 12.10 Frontend · AI & Floating Insights

#### `ai/AIAnalystPanel.jsx`
Fixed bottom-right FAB (left of the Emergent watermark). Opens a 400-px-wide glass panel with:
- Status header (green = primary online, yellow = fallback)
- Scrollable chat log (user bubbles inverted via `bg-accent-strong`)
- Starter prompts for fresh sessions
- Calls `aiChat()` which hits external `/chat/analyst` first, Emergent LLM Claude fallback second

#### `ai/FloatingInsights.jsx`
Exports two popover buttons rendered inside `UnifiedInsightRow`:
- `BriefingButton` — auto-generated narrative insights (up to 6) computed from `categoryDist`, `locations`, `posts`
- `ActionsButton` — 4 tactical recommendations tagged with urgency (IMMEDIATE / 48H / 72H / THIS WEEK); clicking a card opens the corresponding DetailDrawer

### 12.11 Frontend · Shared

#### `shared/SeverityBar.jsx`
The canonical severity distribution bar. Both colour segments AND legend chips are buttons; clicking any segment opens a severity-scoped DetailDrawer.

#### `shared/HierarchyCrumb.jsx`
Standardised chevron-separated crumb: **VEN → SITE → CAT → SUB → SEV → STATE → PLAT**. Used in DetailDrawer and PostDetailDialog so every artefact carries full context.

#### `shared/ExecutiveInsights.jsx`
Legacy inline briefing block (replaced by `FloatingInsights` but kept for re-embedding if a static page needs it).

---

## 13. Data Flow

```
Filters ──► AppContext.paramsFromFilters ──► safeFetch(external) ──► data state
                                                ▲                     │
                                                └── on error: getMockData(filterAware)
                                                                      │
                    ┌────────── derived metrics (kpis/…) ◄─────────── ┘
                    ▼
  Shell header ◄── UnifiedInsightRow (KPIs + Briefing + Actions popovers)
                    │
  Active tab ◄───── Overview / Map / Analysis / Feed
                    │
  DetailDrawer ◄── setSelectedDetail({ type, payload })       opens a Sheet
  PostDialog   ◄── setSelectedPost(post)                      opens a Dialog
                    │
  AI Chat ◄──────── aiChat() → /chat/analyst → Emergent LLM
```

WebSocket events feed `livePosts` and `alerts` in `AppContext` and trigger a sonner toast for HIGH_RISK.

---

## 14. Styling & Design Tokens

`src/index.css` owns the **entire** theme:

- **Palette** — light "command-center paper" (`--bg-app`, `--bg-surface`, `--bg-panel`, `--bg-inset`, `--text-primary/secondary/muted`)
- **Severity semantic colors** — Critical `#DC2626`, High `#EA8200`, Medium `#D1A400`, Low `#16A34A`
- **Accent pair** — `--accent: #0A0A0A`, `--accent-fg: #FFFFFF` (used by active tabs, primary buttons, user chat bubbles)
- **Type** — `Chivo` (display) + `JetBrains Mono` (data/body)
- **Tailwind-class overrides** — `.text-white*`, `.bg-white/*`, `.border-white/*`, `.divide-white/*` are remapped to light-theme equivalents so existing dark-theme class strings render legibly without component-by-component rewrites
- **Leaflet overrides** — CartoDB Light tiles, forced low z-index on all `.leaflet-*` panes so Sheet/Dialog overlays always sit on top
- **Utilities** — `.panel`, `.panel-dark`, `.border-hair`, `.label-micro`, `.label-data`, `.glass`, `.bg-accent-strong`
- **Animations** — `ticker` marquee (200 s), `pulse-dot`, `kenburns` (inline)

---

## 15. Troubleshooting

| Symptom | Fix |
|---|---|
| `DEMO` chip visible | External backend unreachable — mock fallback active. Verify `REACT_APP_API_URL` and network egress |
| WebSocket not green | `wss://…/ws/dashboard` blocked; mock ticker kicks in automatically |
| AI Analyst replies "unavailable" | Check `EMERGENT_LLM_KEY` / `OLLAMA_URL`; view `uvicorn` logs |
| `yarn start` OpenSSL error | `export NODE_OPTIONS=--openssl-legacy-provider` |
| Leaflet tiles missing | Firewall blocks `basemaps.cartocdn.com` — switch to OSM in `LeafletMap.jsx` |
| Map covers DetailDrawer | Do not remove `.leaflet-pane { z-index: 1 !important }` from `index.css` |
| KPI numbers render white | Only set explicit `color` for numerals — use `var(--text-primary)` for defaults |

---

## 16. Project Layout

```
/app
├── backend/                 FastAPI proxy
│   ├── server.py            /api/ai/chat + CORS + health
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── App.js           routes, AuthProvider, AppProvider, Toaster
│       ├── App.css          minimal
│       ├── index.css        THEME + Tailwind overrides
│       ├── index.js         React 19 root
│       ├── contexts/
│       │   ├── AuthContext.jsx
│       │   └── AppContext.jsx
│       ├── lib/
│       │   ├── api.js       axios + mock fallback + aiChat()
│       │   ├── mockData.js  620-post seed + filter-aware computations
│       │   └── websocket.js native WS + mock fallback
│       ├── pages/
│       │   ├── Login.jsx
│       │   └── Dashboard.jsx
│       └── components/
│           ├── shell/       DashboardShell, LiveSignalTicker, UnifiedInsightRow, NavigationRow, FiltersRow
│           ├── overview/    OverviewTab, RiskDialGauge (speedometer), HierarchyTree, DetailDrawer
│           ├── map/         GeoMapTab, LeafletMap (+ HeatLayer), StateSummaryTable
│           ├── analysis/    AnalysisTab (+ Pareto, Quadrant, Hotspots, Heatmap sub-components)
│           ├── feed/        LiveFeedTab, PostCard, PostDetailDialog
│           ├── ai/          AIAnalystPanel, FloatingInsights (Briefing + Actions popovers)
│           └── shared/      SeverityBar, HierarchyCrumb, ExecutiveInsights
├── memory/
│   ├── PRD.md
│   └── test_credentials.md
└── README.md                ← this file
```

---

## License
Proprietary / internal. © Adani CIMAP team.
