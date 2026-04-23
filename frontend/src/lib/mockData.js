/* eslint-disable no-plusplus */
// Mock data generator — keeps dashboard populated when external API is unreachable.

const VENTURES = [
  "Adani Ports & SEZ",
  "Adani Power",
  "Adani Green Energy",
  "Adani Enterprises",
  "Adani Transmission",
  "Adani Total Gas",
  "Adani Wilmar",
  "Adani Airports",
];

const STATES = [
  "Gujarat", "Maharashtra", "Jharkhand", "Chhattisgarh", "Odisha",
  "Tamil Nadu", "Karnataka", "Rajasthan", "Kerala", "Andhra Pradesh",
  "Uttar Pradesh", "Madhya Pradesh",
];

const STATE_COORDS = {
  Gujarat: [22.2587, 71.1924],
  Maharashtra: [19.7515, 75.7139],
  Jharkhand: [23.6102, 85.2799],
  Chhattisgarh: [21.2787, 81.8661],
  Odisha: [20.9517, 85.0985],
  "Tamil Nadu": [11.1271, 78.6569],
  Karnataka: [15.3173, 75.7139],
  Rajasthan: [27.0238, 74.2179],
  Kerala: [10.8505, 76.2711],
  "Andhra Pradesh": [15.9129, 79.7400],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Madhya Pradesh": [22.9734, 78.6569],
};

const CATEGORIES = [
  "Political & Crony Capitalism",
  "Environment & Resource Conflicts",
  "Land & Displacement",
  "Legal & Litigation",
  "Financial Irregularities",
  "Community Protests",
  "Media & Narrative",
];

const SUBCATEGORIES = {
  "Political & Crony Capitalism": ["Preferential Treatment", "Policy Bias", "Modi-Adani Nexus"],
  "Environment & Resource Conflicts": ["Coal Mining", "Coastal Ecology", "Deforestation", "Pollution"],
  "Land & Displacement": ["Forced Acquisition", "Tribal Rights", "Sacred Land", "FRA Violation"],
  "Legal & Litigation": ["Defamation", "Court Petitions", "Regulatory Action"],
  "Financial Irregularities": ["Foreign Funding", "LIC/SBI Exposure", "Disclosure"],
  "Community Protests": ["Villager Resistance", "Fisherfolk", "Anti-displacement"],
  "Media & Narrative": ["Investigative", "Press Freedom", "Social Media"],
};

const PLATFORMS = ["twitter", "instagram", "facebook", "reddit", "linkedin", "news"];

const SEVERITIES = ["critical", "high", "medium", "low"];

const SITES = [
  { name: "Mundra Port", venture: "Adani Ports & SEZ", state: "Gujarat" },
  { name: "Dhamra Port", venture: "Adani Ports & SEZ", state: "Odisha" },
  { name: "Krishnapatnam Port", venture: "Adani Ports & SEZ", state: "Andhra Pradesh" },
  { name: "Vizhinjam Port", venture: "Adani Ports & SEZ", state: "Kerala" },
  { name: "Carmichael Mine Support", venture: "Adani Enterprises", state: "Jharkhand" },
  { name: "Godda Power Plant", venture: "Adani Power", state: "Jharkhand" },
  { name: "Mundra Power Plant", venture: "Adani Power", state: "Gujarat" },
  { name: "Raipur Power", venture: "Adani Power", state: "Chhattisgarh" },
  { name: "Khavda Solar Park", venture: "Adani Green Energy", state: "Gujarat" },
  { name: "Kamuthi Solar", venture: "Adani Green Energy", state: "Tamil Nadu" },
  { name: "Mumbai Airport", venture: "Adani Airports", state: "Maharashtra" },
  { name: "Navi Mumbai Airport", venture: "Adani Airports", state: "Maharashtra" },
  { name: "Lucknow Airport", venture: "Adani Airports", state: "Uttar Pradesh" },
  { name: "Mundra SEZ", venture: "Adani Enterprises", state: "Gujarat" },
  { name: "Dharavi Redevelopment", venture: "Adani Enterprises", state: "Maharashtra" },
];

const AUTHORS = [
  { name: "Rahul Gandhi", handle: "@RahulGandhi" },
  { name: "Priyanka Gandhi", handle: "@priyankagandhi" },
  { name: "Mahua Moitra", handle: "@MahuaMoitra" },
  { name: "Paranjoy Guha", handle: "@paranjoygt" },
  { name: "The Wire India", handle: "@thewire_in" },
  { name: "Fisherfolk Forum", handle: "@fishforum" },
  { name: "Adivasi Voice", handle: "@adivasi_voice" },
  { name: "GreenPeace India", handle: "@greenpeaceindia" },
  { name: "Citizens Watch", handle: "@citizenswatch" },
  { name: "OCCRP", handle: "@OCCRP" },
];

const HEADLINES = [
  "Port expansion threatens mangrove ecosystem; locals file PIL",
  "Villagers block coal transport convoy near mine site for third day",
  "Parliament opposition demands JPC into conglomerate's finances",
  "Fisherfolk protest dredging operations; livelihoods at risk",
  "Environment ministry notice over clearance violations",
  "Solar park land dispute escalates; pastoralists move court",
  "Investigative report alleges policy capture in airport privatisation",
  "Tribal council rejects FRA waiver; sends memorandum to collector",
  "SBI, LIC exposure questioned after short-seller report update",
  "Coastal erosion linked to port dredging; marine study cited",
  "Defamation case filed against critic; press freedom groups react",
  "High court stays land acquisition order in SEZ expansion",
];

function seeded(i) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
function pick(arr, i) { return arr[Math.floor(seeded(i) * arr.length)]; }
function randInt(min, max, i) { return Math.floor(seeded(i) * (max - min + 1)) + min; }

export function generatePosts(count = 120, seed = 0) {
  const posts = [];
  for (let i = 0; i < count; i++) {
    const s = seed + i;
    const site = pick(SITES, s);
    const category = pick(CATEGORIES, s + 1);
    const subcat = pick(SUBCATEGORIES[category], s + 2);
    const platform = pick(PLATFORMS, s + 3);
    const severity = pick(SEVERITIES, s + 4);
    const author = pick(AUTHORS, s + 5);
    const sentiment = seeded(s + 6) * 2 - 1;
    const risk = severity === "critical" ? 0.85 + seeded(s) * 0.15
      : severity === "high" ? 0.65 + seeded(s) * 0.2
      : severity === "medium" ? 0.4 + seeded(s) * 0.2
      : 0.1 + seeded(s) * 0.25;
    const hoursAgo = randInt(0, 240, s + 7);
    const ts = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
    posts.push({
      id: `p_${s}`,
      content: HEADLINES[s % HEADLINES.length] + " — " + site.name,
      author: author.name,
      handle: author.handle,
      platform,
      severity,
      venture: site.venture,
      site: site.name,
      state: site.state,
      category,
      subcategory: subcat,
      sentiment: Number(sentiment.toFixed(2)),
      risk_score: Number(risk.toFixed(2)),
      timestamp: ts,
      url: "#",
      has_video: seeded(s + 8) > 0.85,
    });
  }
  return posts;
}

const POSTS_CACHE = generatePosts(220);

function kpis() {
  const critical = POSTS_CACHE.filter((p) => p.severity === "critical").length;
  const high = POSTS_CACHE.filter((p) => p.severity === "high").length;
  const activeSites = new Set(POSTS_CACHE.map((p) => p.site)).size;
  const avgSent = POSTS_CACHE.reduce((a, p) => a + p.sentiment, 0) / POSTS_CACHE.length;
  const last24 = POSTS_CACHE.filter((p) => Date.now() - new Date(p.timestamp).getTime() < 24 * 3600 * 1000).length;
  return {
    total_posts: POSTS_CACHE.length,
    critical_count: critical,
    high_risk_count: high,
    active_sites: activeSites,
    avg_sentiment: Number(avgSent.toFixed(2)),
    posts_last_24h: last24,
  };
}

function locations() {
  const byState = {};
  POSTS_CACHE.forEach((p) => {
    if (!byState[p.state]) {
      byState[p.state] = {
        state: p.state,
        lat: STATE_COORDS[p.state][0],
        lng: STATE_COORDS[p.state][1],
        signals: 0,
        critical: 0,
        avg_risk: 0,
        sentiment: 0,
        sites: new Set(),
      };
    }
    const s = byState[p.state];
    s.signals++;
    if (p.severity === "critical") s.critical++;
    s.avg_risk += p.risk_score;
    s.sentiment += p.sentiment;
    s.sites.add(p.site);
  });
  // also per-site markers
  const bySite = {};
  POSTS_CACHE.forEach((p) => {
    const key = p.site;
    if (!bySite[key]) {
      const base = STATE_COORDS[p.state];
      bySite[key] = {
        id: key,
        site: p.site,
        state: p.state,
        venture: p.venture,
        lat: base[0] + (seeded(key.length) - 0.5) * 1.5,
        lng: base[1] + (seeded(key.length + 1) - 0.5) * 1.5,
        signals: 0,
        critical: 0,
        avg_risk: 0,
      };
    }
    bySite[key].signals++;
    if (p.severity === "critical") bySite[key].critical++;
    bySite[key].avg_risk += p.risk_score;
  });
  Object.values(bySite).forEach((s) => { s.avg_risk = Number((s.avg_risk / s.signals).toFixed(2)); });
  const states = Object.values(byState).map((s) => ({
    state: s.state,
    lat: s.lat,
    lng: s.lng,
    signals: s.signals,
    critical: s.critical,
    avg_risk: Number((s.avg_risk / s.signals).toFixed(2)),
    sentiment: Number((s.sentiment / s.signals).toFixed(2)),
    sites: s.sites.size,
  }));
  return { states, sites: Object.values(bySite) };
}

function hierarchy() {
  const tree = {};
  POSTS_CACHE.forEach((p) => {
    if (!tree[p.venture]) tree[p.venture] = { name: p.venture, sites: {}, signals: 0, critical: 0 };
    const v = tree[p.venture];
    v.signals++;
    if (p.severity === "critical") v.critical++;
    if (!v.sites[p.site]) v.sites[p.site] = { name: p.site, state: p.state, categories: {}, signals: 0, critical: 0 };
    const s = v.sites[p.site];
    s.signals++;
    if (p.severity === "critical") s.critical++;
    if (!s.categories[p.category]) s.categories[p.category] = { name: p.category, subpoints: {}, signals: 0, critical: 0 };
    const c = s.categories[p.category];
    c.signals++;
    if (p.severity === "critical") c.critical++;
    if (!c.subpoints[p.subcategory]) c.subpoints[p.subcategory] = { name: p.subcategory, signals: 0, critical: 0 };
    c.subpoints[p.subcategory].signals++;
    if (p.severity === "critical") c.subpoints[p.subcategory].critical++;
  });
  return Object.values(tree).map((v) => ({
    ...v,
    sites: Object.values(v.sites).map((s) => ({
      ...s,
      categories: Object.values(s.categories).map((c) => ({
        ...c,
        subpoints: Object.values(c.subpoints),
      })),
    })),
  })).sort((a, b) => b.critical - a.critical);
}

function platformDistribution() {
  const counts = {};
  POSTS_CACHE.forEach((p) => { counts[p.platform] = (counts[p.platform] || 0) + 1; });
  return Object.entries(counts).map(([platform, count]) => ({ platform, count }));
}

function severityDistribution() {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  POSTS_CACHE.forEach((p) => { counts[p.severity]++; });
  const total = POSTS_CACHE.length;
  return SEVERITIES.map((s) => ({
    severity: s,
    count: counts[s],
    percent: Math.round((counts[s] / total) * 100),
  }));
}

function categoryDistribution() {
  const counts = {};
  POSTS_CACHE.forEach((p) => {
    if (!counts[p.category]) counts[p.category] = { category: p.category, signals: 0, critical: 0, risk: 0 };
    counts[p.category].signals++;
    if (p.severity === "critical") counts[p.category].critical++;
    counts[p.category].risk += p.risk_score;
  });
  return Object.values(counts).map((c) => ({
    ...c,
    avg_risk: Number((c.risk / c.signals).toFixed(2)),
  })).sort((a, b) => b.avg_risk - a.avg_risk);
}

function sentimentTrend() {
  const days = 30;
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const bucketStart = Date.now() - i * 86400 * 1000;
    const day = new Date(bucketStart);
    const posts = POSTS_CACHE.filter((p) => {
      const diff = bucketStart - new Date(p.timestamp).getTime();
      return diff >= 0 && diff < 86400 * 1000;
    });
    const avg = posts.length ? posts.reduce((a, p) => a + p.sentiment, 0) / posts.length : 0;
    const risk = posts.length ? posts.reduce((a, p) => a + p.risk_score, 0) / posts.length : 0;
    const critical = posts.filter((p) => p.severity === "critical").length;
    out.push({
      bucket: day.toISOString().slice(0, 10),
      posts: posts.length + Math.floor(seeded(i) * 50),
      critical: critical + Math.floor(seeded(i + 1) * 10),
      avg_sentiment: Number(avg.toFixed(2)),
      avg_risk: Number(risk.toFixed(2)),
    });
  }
  return out;
}

function reportsArea() {
  return locations().states.sort((a, b) => b.critical - a.critical);
}

function ventureBreakdown() {
  const counts = {};
  POSTS_CACHE.forEach((p) => {
    if (!counts[p.venture]) counts[p.venture] = { venture: p.venture, critical: 0, high: 0, medium: 0, low: 0, total: 0, sentiment: 0, risk: 0 };
    const v = counts[p.venture];
    v[p.severity]++;
    v.total++;
    v.sentiment += p.sentiment;
    v.risk += p.risk_score;
  });
  return Object.values(counts).map((v) => ({
    ...v,
    avg_sentiment: Number((v.sentiment / v.total).toFixed(2)),
    avg_risk: Number((v.risk / v.total).toFixed(2)),
  })).sort((a, b) => b.critical - a.critical);
}

function topSites() {
  const byS = {};
  POSTS_CACHE.forEach((p) => {
    if (!byS[p.site]) byS[p.site] = { site: p.site, venture: p.venture, state: p.state, signals: 0, critical: 0, risk: 0, sentiment: 0 };
    byS[p.site].signals++;
    if (p.severity === "critical") byS[p.site].critical++;
    byS[p.site].risk += p.risk_score;
    byS[p.site].sentiment += p.sentiment;
  });
  return Object.values(byS).map((s) => ({
    ...s,
    avg_risk: Number((s.risk / s.signals).toFixed(2)),
    avg_sentiment: Number((s.sentiment / s.signals).toFixed(2)),
  })).sort((a, b) => b.critical * 10 + b.avg_risk - (a.critical * 10 + a.avg_risk)).slice(0, 10);
}

export function getMockData(key, params = {}) {
  const p = (key || "").toLowerCase();
  if (p.includes("/kpis")) return kpis();
  if (p.includes("/posts/live")) return POSTS_CACHE.slice(0, params.limit || 20);
  if (p.includes("/posts")) {
    let list = [...POSTS_CACHE];
    if (params.severity) list = list.filter((x) => x.severity === params.severity);
    if (params.platform && params.platform !== "all") list = list.filter((x) => x.platform === params.platform);
    if (params.state) list = list.filter((x) => x.state === params.state);
    if (params.venture) list = list.filter((x) => x.venture === params.venture);
    if (params.category) list = list.filter((x) => x.category === params.category);
    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter((x) =>
        x.content.toLowerCase().includes(q) ||
        x.author.toLowerCase().includes(q) ||
        x.site.toLowerCase().includes(q)
      );
    }
    return list.slice(params.skip || 0, (params.skip || 0) + (params.limit || 50));
  }
  if (p.includes("/locations")) return locations();
  if (p.includes("/hierarchy")) return hierarchy();
  if (p.includes("/platform-distribution")) return platformDistribution();
  if (p.includes("/activity-distribution") || p.includes("/reports/severity")) return severityDistribution();
  if (p.includes("/reports/categories")) return CATEGORIES;
  if (p.includes("/reports/area")) return reportsArea();
  if (p.includes("/sentiment-trend")) return sentimentTrend();
  if (p === "category-distribution") return categoryDistribution();
  if (p === "venture-breakdown") return ventureBreakdown();
  if (p === "top-sites") return topSites();
  if (p === "severity-distribution") return severityDistribution();
  return null;
}

export function mockWebSocketEvent() {
  const post = POSTS_CACHE[Math.floor(Math.random() * POSTS_CACHE.length)];
  const newPost = {
    ...post,
    id: `live_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  if (Math.random() < 0.15) {
    return { event: "HIGH_RISK_ALERT", payload: { ...newPost, severity: "critical", risk_score: 0.92 } };
  }
  return { event: "NEW_POSTS", payload: [newPost] };
}

export const META = { VENTURES, STATES, CATEGORIES, SUBCATEGORIES, PLATFORMS, SEVERITIES };
