# Adani CIMAP: Comprehensive API Specification

This document provides a complete technical reference for all endpoints available in the Adani Intelligence Dashboard backend.

---

## 🏛️ Core Metadata
- **Base URL**: `https://adani-backend-h3ij.onrender.com/api`
- **WebSocket URL**: `wss://adani-backend-h3ij.onrender.com/ws/dashboard`
- **Auth Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Ingest Header**: `X-API-Key: <INGEST_KEY>`

> [!IMPORTANT]
> **⚠️ Security Note: Token Persistence**
> This system uses **Stateless JWT** (JSON Web Tokens). 
> - **Logout Logic**: Logging out via `/api/auth/logout` only clears the browser cookies. It does **not** invalidate the Bearer token.
> - **Expiry**: Each token is cryptographically valid for **8 hours** from the moment of creation.
> - **Postman/Curl**: Your Bearer token will continue to work in terminal/Postman until it naturally expires, even if you are logged out of the dashboard.

---

## 📊 Complete Endpoint Registry (18 Total)

| # | Category | Endpoint | Method | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| 1-3 | Auth | `/auth/login`, `/logout`, `/me` | `POST/GET`| User Session & Verification |
| 4 | Feed | `/posts` | `GET` | Main Searchable Signal Feed |
| 5 | Feed | `/posts/live` | `GET` | Fast Real-time Dashboard Ticker |
| 6 | Feed | `/posts/export` | `GET` | Download Professional CSV Reports |
| 7 | KPI | `/kpis` | `GET` | Dashboard Counter Statistics |
| 8 | Map | `/locations` | `GET` | Geospatial Map Markers & Pins |
| 9 | Trend | `/sentiment-trend` | `GET` | Historical Sentiment/Risk Graphs |
| 10 | Tree | `/hierarchy` | `GET` | Venture/Site Drill-down Hierarchy |
| 11 | Stats | `/activity-distribution` | `GET` | Activity Category Risk Breakdown |
| 12 | Stats | `/platform-distribution` | `GET` | Social Platform Volume Breakdown |
| 13 | Stats | `/reports/area` | `GET` | State-wise Activity Intel Report |
| 14 | Meta | `/reports/categories` | `GET` | List of All Valid Filter Names |
| 15 | Stats | `/reports/severity` | `GET` | Risk Level (Critical/High) Distribution |
| 16 | AI | `/chat/analyst` | `POST` | Chat with Gemini 1.5 Pro |
| 17 | Data | `/ingest/posts` | `POST` | High-Speed Scraper Ingestion |
| 18 | Live | `/ws/dashboard` | `WS` | Real-time Dashboard Sync Bridge |

---

## 🛠️ Parameter Cheat Sheet (How to Filter)

To get different results, append these to your URL (e.g., `/api/posts?q=Mundra`).

| Parameter | What to Change it to? | What can be included? | How it works / What you get |
| :--- | :--- | :--- | :--- |
| **`q`** | `q=Mundra` | Any keyword or name. | **Keyword Search**: Scans the entire post content, author name, handle, and site name for this text. |
| **`window`** | `window=24h` | `24h`, `48h`, `7d`, `30d` | **Relative Time**: Filters data from exactly X hours/days ago until now. Great for "Last 24 Hours" views. |
| **`bucket`** | `bucket=day` | `hour`, `day`, `week`, `month` | **Chart Resolution**: Groups data points. `hour` is ultra-precise (24h views); `day` shows daily spikes; `month` shows long-term trends. |
| **`platform`** | `platform=twitter`| `twitter`, `instagram`, `facebook`, `reddit`, `linkedin` | **Source Filter**: Restricts results to a specific social network. Use `all` to reset. |
| **`severity`** | `severity=critical`| `critical`, `high`, `medium`, `low` | **Risk Filter**: Zeroes in on specific threat levels. `critical` shows only the most dangerous signals. |
| **`venture`** | `venture=Adani Power`| `Adani Ports & SEZ`, `Adani Power`, `Adani Green`, `Adani Enterprises` | **Business Unit Filter**: Shows only signals related to a specific Adani company. |
| **`state`** | `state=Kerala` | `Gujarat`, `Maharashtra`, `Kerala`, `Rajasthan`, etc. | **Geographic Filter**: Filters signals by the Indian state where the activity is happening. |
| **`start`/`end`**| `start=2024-04-01` | Date in `YYYY-MM-DD` | **Custom Calendar**: Overrides `window` to show a fixed period. Must use both `start` and `end` for a range. |
| **`limit`** | `limit=100` | Any number (1 to 500) | **Volume Control**: Controls how many posts are returned in one page. Default is 50. |

---

## 🎯 Filter Example Curls (One for Every Filter)

Use these to test each individual filter. I have highlighted what was changed in each.

### 1. The Keyword Search (`q`)
*   **What changed?**: Added `?q=Hindenburg`
*   **Effect**: Filters for ANY post mentioning "Hindenburg".
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?q=Hindenburg" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 2. The Time Window (`window`)
*   **What changed?**: Added `?window=7d`
*   **Effect**: Shows only signals from the last 7 days.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?window=7d" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 3. The Source Platform (`platform`)
*   **What changed?**: Added `?platform=reddit`
*   **Effect**: Restricts results to Reddit only.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?platform=reddit" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 4. The Severity Level (`severity`)
*   **What changed?**: Added `?severity=critical`
*   **Effect**: Shows ONLY the most dangerous signals.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?severity=critical" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 5. The Venture Filter (`venture`)
*   **What changed?**: Added `?venture=Adani Power`
*   **Effect**: Filters for signals related specifically to Adani Power.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?venture=Adani Power" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 6. The Geographic State (`state`)
*   **What changed?**: Added `?state=Gujarat`
*   **Effect**: Shows signals occurring in Gujarat.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?state=Gujarat" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 7. Custom Date Range (`start/end`)
*   **What changed?**: Added `?start=2024-04-10&end=2024-04-15`
*   **Effect**: Filters signals between April 10th and 15th.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?start=2024-04-10&end=2024-04-15" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 8. Pagination Control (`limit/skip`)
*   **What changed?**: Added `?limit=5&skip=10`
*   **Effect**: Skips the first 10 posts and gives you the next 5.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?limit=5&skip=10" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

---

## 🔐 Authentication & Session
| Endpoint | Method | Params | Description |
| :--- | :---: | :--- | :--- |
| `/auth/login` | `POST` | `email, password` | Returns JWT and user object. Sets HttpOnly cookie. |
| `/auth/logout` | `POST` | - | Clears the session cookie. |
| `/auth/me` | `GET` | - | Returns current user profile (requires auth). |

---

## 📊 Analytical Aggregations (GET)
All analytical endpoints support these common filters:
`platform`, `venture`, `severity`, `category`, `state`, `date`, `window` (24h/30d), `start`, `end`.

### 1. Main Metrics
- **Endpoint**: `/kpis`
- **Fields**: `total_posts`, `critical_count`, `high_risk_count`, `active_sites`, `avg_sentiment`, `posts_last_24h`.

### 2. Time-Series Trends
- **Endpoint**: `/sentiment-trend`
- **Required Param**: `bucket` (`hour`, `day`, `week`, `month`, `year`)
- **Fields**: `bucket`, `posts`, `avg_sentiment`, `avg_risk`.

### 3. Drill-Down Hierarchy
- **Endpoint**: `/hierarchy`
- **Description**: Returns Venture → Site → Category → Subpoint tree with counts and risk levels.

### 4. Geospatial Data
- **Endpoint**: `/locations`
- **Description**: Returns verified site markers with risk heat signatures and site-specific metadata.

### 5. Distributions & Analytics
- **Endpoint**: `/activity-distribution` - Severity-wise volume.
- **Endpoint**: `/platform-distribution` - Market share (Twitter, IG, FB, etc.).
- **Endpoint**: `/reports/area` - State-wise activity counts and critical counts.
- **Endpoint**: `/reports/categories` - Lists available category and venture names.
- **Endpoint**: `/reports/severity` - Simple severity count breakdown.

---

## 📜 Signal Feed & Export (GET)

### 1. Global Signal Feed
- **Endpoint**: `/posts`
- **Params**: `q` (search text), `limit`, `skip` + all filters.
- **Features**: Deduplicated, AI-summarized, and sentiment-tagged posts.

### 2. Live Ticker
- **Endpoint**: `/posts/live`
- **Params**: `limit`
- **Description**: Lightweight feed optimized for real-time dashboard updates.

### 3. Data Export (CSV)
- **Endpoint**: `/posts/export`
- **Params**: All filters + `access_token` (as query param for browser downloads).
- **Description**: Generates a professional CSV report with executive metadata.

---

## 🤖 Interaction & Ingestion (POST)

### 1. AI Analyst Chat
- **Endpoint**: `/chat/analyst`
- **Body**: `{"message": "string", "session_id": "string"}`
- **Intelligence**: Grounded in real-time database context using Gemini 1.5 Pro.

### 2. High-Speed Ingestion (Scrapers)
- **Endpoint**: `/ingest/posts`
- **Body**: Array of `IngestPost` objects.
- **Header**: `X-API-Key` required.
- **Features**: Upserts by URL, auto-enriches with Gemini/Heuristic AI, broadcasts to WebSocket.

---

## 📡 Real-Time Bridge (WebSocket)
- **Path**: `/ws/dashboard`
- **Events**:
    - `NEW_POSTS`: Batch of newly ingested signals.
    - `HIGH_RISK_ALERT`: Immediate push for critical signals.
    - `MULTI_HIGH_RISK_ALERT`: Aggregated strategic alert for high-volume spikes.

---

## 🚀 Quick-Start Testing (Production Curls)

Copy and paste these directly into your terminal or Postman. 
*Note: Your current token expires in 8 hours.*

### 1. Check Session (Get Me)
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/auth/me" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 2. Main KPI Stats
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/kpis?window=24h" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 3. Historical Trends (Daily)
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/sentiment-trend?bucket=day&platform=all" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 4. Venture Drill-Down (Hierarchy)
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/hierarchy" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 5. Map Markers (Locations)
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/locations?state=all" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 6. CSV Report Export
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts/export?severity=critical" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 7. AI Analyst Interaction
```bash
curl -X POST "https://adani-backend-h3ij.onrender.com/api/chat/analyst" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc" \
     -H "Content-Type: application/json" \
     -d '{"message": "Summarize latest critical activity."}'
```

### 8. Live Ingestion (API-KEY Mode)
```bash
curl -X POST "https://adani-backend-h3ij.onrender.com/api/ingest/posts" \
     -H "X-API-Key: 4d270df919e95630e697c6fe62e74d79" \
     -H "Content-Type: application/json" \
     -d '[{"platform": "Twitter", "author": "Bot", "handle": "@test", "content": "Alert test", "url": "https://t.co/test", "created_at": "2024-04-23 15:30"}]'
```

---

## 🔍 Advanced Filter Variations (Copy-Paste)

Use these to test specific edge-cases and high-level analytical filtering.

### A. Custom Date Range (e.g., April 1st to April 23rd)
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?start=2024-04-01&end=2024-04-23&limit=10" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### B. Specific Venture + Critical Signals (Adani Green Example)
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?venture=Adani Green Energy&severity=critical" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### C. Specific Category + Platform (Environment on Instagram)
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?category=Environment & Resource Conflicts&platform=instagram" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### D. Deep Keyword Search (e.g., "Mundra Port")
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?q=Mundra Port&limit=5" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### E. Pagination Test (Skip first 20, get next 10)
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?limit=10&skip=20" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

---

## 🔬 High-Precision Multi-Parameter Queries

Use these "Deep Drill" templates to combine 3 or more filters for exact analysis.

### 1. "Critical Source Analysis" (Twitter + Critical + Mundra)
*   **Parameters**: `platform=twitter` & `severity=critical` & `q=Mundra`
*   **What changed?**: We are now filtering by Source, Risk, and Keyword simultaneously.
*   **Effect**: Finds ONLY the high-threat tweets regarding the Mundra site.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?platform=twitter&severity=critical&q=Mundra" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 2. "Venture Risk Audit" (Adani Green + High Risk + 30 Days)
*   **Parameters**: `venture=Adani Green Energy` & `severity=high` & `window=30d`
*   **What changed?**: Combines Business Unit, Risk Threshold, and Historical Window.
*   **Effect**: Generates a 1-month risk report specifically for the Green Energy portfolio.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?venture=Adani Green Energy&severity=high&window=30d" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 3. "Regional Crisis Monitor" (Kerala + Activism + Last 24h)
*   **Parameters**: `state=Kerala` & `category=Social & Political Activism` & `window=24h`
*   **What changed?**: Combines Geography, Activity Type, and Immediate Timeframe.
*   **Effect**: Monitors for breaking protest activity in a specific sensitive region.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/posts?state=Kerala&category=Social & Political Activism&window=24h" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

### 4. "High-Precision Trend Analysis" (24h Window + Hourly Buckets)
*   **Parameters**: `window=24h` & `bucket=hour`
*   **What changed?**: Requesting a rolling 24-hour window with data grouped by hour.
*   **Effect**: Generates a high-resolution chart showing exactly when risk spikes occurred throughout the day.
```bash
curl -X GET "https://adani-backend-h3ij.onrender.com/api/sentiment-trend?window=24h&bucket=hour" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzc0Y2VjNi03NDBhLTQ5ZGUtOTFhZi0wNTZhYjZkOGNhMmUiLCJlbWFpbCI6ImFkbWluQGFkYW5pLWludGVsLmNvbSIsImV4cCI6MTc3Njk2NjY0OCwidHlwZSI6ImFjY2VzcyJ9.CA4OU-7sfjzFZ45nk2I5istfOk3lwaY80ojNuQuDBGc"
```

---
*Maintained by CIMAP Intelligence Team*


