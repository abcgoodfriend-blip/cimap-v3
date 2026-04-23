# Adani CIMAP — OSINT Intelligence Dashboard

## Original Problem Statement
Build a production-grade OSINT Intelligence Dashboard (Frontend Only) for monitoring Adani's public perception, risks, and emerging threats across social media, news, and digital ecosystems using the provided backend APIs and WebSocket. Designed for executives, analysts, and PR teams. Prioritizes immediate risk visibility, pattern recognition, rapid drill-down, minimal noise maximum signal clarity.

## Architecture
- **Frontend**: React 19 + Tailwind + Shadcn UI + Recharts + React-Leaflet
- **Backend (thin proxy)**: FastAPI
  - `/api/ai/chat` → proxies to external `/chat/analyst` (Gemini 1.5 Pro); falls back to Emergent LLM (Claude Sonnet 4.5) when external fails
- **Realtime**: WebSocket to `wss://adani-backend-h3ij.onrender.com/ws/dashboard` with auto-fallback to local mock stream every 4s
- **External API**: `https://adani-backend-h3ij.onrender.com/api` (CIMAP backend). On any failure, frontend transparently falls back to seeded mock data (220 signals, 8 ventures, 15 sites, 12 states, 7 categories).

## Design System
- Theme: **Archetype 4 (Swiss & High-Contrast) — Dark "war-room / NOC"**
- Fonts: **Chivo** (display) · **JetBrains Mono** (data / body)
- Severity palette (semantic, non-negotiable): Critical `#FF3B30`, High `#FF9500`, Medium `#FFCC00`, Low `#34C759`
- Layout: Control-Room Grid, 1px hairline borders, sharp edges (radius ≤ 4px), left-aligned, high density

## What's been implemented (Feb 2026)
- **Auth**: JWT login against external backend + robust Demo-Mode fallback with role selection
- **Global shell**: sticky Live Signal Ticker (marquee, pause-on-hover, HIGH_RISK highlight, uplink/demo indicator) · Unified Insight Row (Severity Distribution Bar + 6 KPI cards: Total / Critical / High-Risk / Active Sites / Avg Sentiment / Posts 24h) · Navigation tabs (Overview, Geospatial Map, Analysis, Live Feed) · Global Search · Filter row (Venture, Category, Subcategory, Severity, State, Platform, Range, Start/End, Clear) · Export, Notifications popover, Role switcher (Executive/Analyst/PR), User menu
- **Overview Tab**: Category Risk Dial Gauges (half-donut SVG gauges per category) + Hierarchical Drilldown Tree (Venture → Site → Category → Sub-point) sorted by severity. Clicks open Detail Drawer.
- **Detail Drawer**: Inline KPI summary · Severity distribution bar · Risk drivers (top categories with progress bars) · Trend/Velocity/Narrative indicators · Platform pie chart · Top Critical Signals (clickable to post detail) · Business Verticals with % Risk Contribution
- **Geospatial Map Tab**: Dark Leaflet map (CartoDB Dark Matter) with severity-colored site markers (size by signal count) · State Summary Table with HOTSPOT badges · click-through to detail drawer
- **Analysis Tab**: Date range selector · Venture Signal Breakdown (stacked horizontal bars, 4 severity colors) · Top 10 Most Critical Sites table · Risk Index Gauge (composite 0-100 system indicator) · Critical Signal Volume 30-day trend line
- **Live Post Feed**: Platform distribution badges · Search bar · 3 vertical columns (Negative / Neutral / Positive) · compact post cards with severity dot, platform, state, author, sentiment, risk_score · hover preview (beside cursor, video indicator) · click to Post Detail
- **Post Detail Dialog**: Full Venture→Category→Subcategory→Severity→State hierarchy · Risk gauge · Sentiment gauge · Content metadata · Related signals list
- **Floating AI Analyst**: Glass-morphism panel (bottom-right FAB). Starter prompts. Calls `/chat/analyst` then falls back via local `/api/ai/chat` → Emergent LLM (Claude Sonnet 4.5).
- **Alert System**: WebSocket `HIGH_RISK_ALERT` triggers sonner toast + pulses in ticker + notification bell counter
- **Executive Insights**: Auto-generated briefing cards (top category driver, state hotspot, negative trend count)
- **Role presets** + **mock fallback** throughout

## Environment
- `/app/frontend/.env`: `REACT_APP_API_URL`, `REACT_APP_WS_URL`, `REACT_APP_BACKEND_URL`
- `/app/backend/.env`: `EMERGENT_LLM_KEY`, `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`

## Next Priority Items (P1 / P2)
- P1: Saved filter presets per role (persist to localStorage)
- P1: Narrative clustering view grouping signals into themes via AI
- P2: CSV export verified against real backend (currently opens the external endpoint in a new tab)
- P2: Multi-signal correlation alert UI lane
- P2: Heat clustering overlay on map using `leaflet.markercluster`
- P2: Sentiment trend comparison chart in Analysis tab (week-over-week delta)
- P2: Post hover auto-play video when `has_video` true (currently shows placeholder)
