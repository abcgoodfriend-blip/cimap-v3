/* eslint-disable no-plusplus */
// Mock data generator — richer dataset + full filter-aware computation.

const VENTURES = [
  "Adani Ports & SEZ", "Adani Power", "Adani Green Energy", "Adani Enterprises",
  "Adani Transmission", "Adani Total Gas", "Adani Wilmar", "Adani Airports",
];

const STATES = [
  "Gujarat", "Maharashtra", "Jharkhand", "Chhattisgarh", "Odisha",
  "Tamil Nadu", "Karnataka", "Rajasthan", "Kerala", "Andhra Pradesh",
  "Uttar Pradesh", "Madhya Pradesh", "Telangana", "West Bengal",
];

const STATE_COORDS = {
  Gujarat: [22.2587, 71.1924], Maharashtra: [19.7515, 75.7139],
  Jharkhand: [23.6102, 85.2799], Chhattisgarh: [21.2787, 81.8661],
  Odisha: [20.9517, 85.0985], "Tamil Nadu": [11.1271, 78.6569],
  Karnataka: [15.3173, 75.7139], Rajasthan: [27.0238, 74.2179],
  Kerala: [10.8505, 76.2711], "Andhra Pradesh": [15.9129, 79.7400],
  "Uttar Pradesh": [26.8467, 80.9462], "Madhya Pradesh": [22.9734, 78.6569],
  Telangana: [17.1232, 79.2089], "West Bengal": [22.9868, 87.8550],
};

const CATEGORIES = [
  "Political & Crony Capitalism", "Environment & Resource Conflicts",
  "Land & Displacement", "Legal & Litigation", "Financial Irregularities",
  "Community Protests", "Media & Narrative",
];

const SUBCATEGORIES = {
  "Political & Crony Capitalism": ["Preferential Treatment", "Policy Bias", "Modi-Adani Nexus", "Lobbying"],
  "Environment & Resource Conflicts": ["Coal Mining", "Coastal Ecology", "Deforestation", "Pollution", "Mangrove Loss"],
  "Land & Displacement": ["Forced Acquisition", "Tribal Rights", "Sacred Land", "FRA Violation", "Inadequate R&R"],
  "Legal & Litigation": ["Defamation", "Court Petitions", "Regulatory Action", "Stays & Injunctions"],
  "Financial Irregularities": ["Foreign Funding", "LIC/SBI Exposure", "Disclosure", "SEC/DoJ Probe", "Hindenburg"],
  "Community Protests": ["Villager Resistance", "Fisherfolk", "Anti-displacement", "Sit-in / Dharna"],
  "Media & Narrative": ["Investigative", "Press Freedom", "Social Media", "Gag Orders"],
};

const PLATFORMS = ["twitter", "instagram", "facebook", "reddit", "linkedin", "news"];
const SEVERITIES = ["critical", "high", "medium", "low"];

const SITES = [
  { name: "Mundra Port", venture: "Adani Ports & SEZ", state: "Gujarat" },
  { name: "Dhamra Port", venture: "Adani Ports & SEZ", state: "Odisha" },
  { name: "Krishnapatnam Port", venture: "Adani Ports & SEZ", state: "Andhra Pradesh" },
  { name: "Vizhinjam Port", venture: "Adani Ports & SEZ", state: "Kerala" },
  { name: "Karaikal Port", venture: "Adani Ports & SEZ", state: "Tamil Nadu" },
  { name: "Ennore Port", venture: "Adani Ports & SEZ", state: "Tamil Nadu" },
  { name: "Carmichael Mine Support", venture: "Adani Enterprises", state: "Jharkhand" },
  { name: "Godda Power Plant", venture: "Adani Power", state: "Jharkhand" },
  { name: "Mundra Power Plant", venture: "Adani Power", state: "Gujarat" },
  { name: "Raipur Power", venture: "Adani Power", state: "Chhattisgarh" },
  { name: "Tiroda Power", venture: "Adani Power", state: "Maharashtra" },
  { name: "Udupi Power", venture: "Adani Power", state: "Karnataka" },
  { name: "Khavda Solar Park", venture: "Adani Green Energy", state: "Gujarat" },
  { name: "Kamuthi Solar", venture: "Adani Green Energy", state: "Tamil Nadu" },
  { name: "Rajasthan Wind Farm", venture: "Adani Green Energy", state: "Rajasthan" },
  { name: "Mumbai Airport", venture: "Adani Airports", state: "Maharashtra" },
  { name: "Navi Mumbai Airport", venture: "Adani Airports", state: "Maharashtra" },
  { name: "Lucknow Airport", venture: "Adani Airports", state: "Uttar Pradesh" },
  { name: "Jaipur Airport", venture: "Adani Airports", state: "Rajasthan" },
  { name: "Thiruvananthapuram Airport", venture: "Adani Airports", state: "Kerala" },
  { name: "Mundra SEZ", venture: "Adani Enterprises", state: "Gujarat" },
  { name: "Dharavi Redevelopment", venture: "Adani Enterprises", state: "Maharashtra" },
  { name: "Mumbai Transmission", venture: "Adani Transmission", state: "Maharashtra" },
  { name: "Gujarat Gas Grid", venture: "Adani Total Gas", state: "Gujarat" },
  { name: "Mundra Edible Oil", venture: "Adani Wilmar", state: "Gujarat" },
  { name: "Kolkata Edible Oil", venture: "Adani Wilmar", state: "West Bengal" },
  { name: "Hyderabad Transmission", venture: "Adani Transmission", state: "Telangana" },
];

const AUTHORS = [
  { name: "Rahul Gandhi", handle: "@RahulGandhi", followers: 24_800_000 },
  { name: "Priyanka Gandhi", handle: "@priyankagandhi", followers: 6_200_000 },
  { name: "Mahua Moitra", handle: "@MahuaMoitra", followers: 2_100_000 },
  { name: "Paranjoy Guha", handle: "@paranjoygt", followers: 98_000 },
  { name: "The Wire India", handle: "@thewire_in", followers: 2_500_000 },
  { name: "Newslaundry", handle: "@newslaundry", followers: 610_000 },
  { name: "Fisherfolk Forum", handle: "@fishforum", followers: 14_000 },
  { name: "Adivasi Voice", handle: "@adivasi_voice", followers: 22_000 },
  { name: "GreenPeace India", handle: "@greenpeaceindia", followers: 320_000 },
  { name: "Citizens Watch", handle: "@citizenswatch", followers: 58_000 },
  { name: "OCCRP", handle: "@OCCRP", followers: 240_000 },
  { name: "Arundhati Roy", handle: "@arundhati_roy", followers: 980_000 },
  { name: "Nityanand Jayaraman", handle: "@nityajayaraman", followers: 44_000 },
  { name: "Down to Earth", handle: "@down2earthindia", followers: 480_000 },
  { name: "Medha Patkar", handle: "@medhapatkar", followers: 130_000 },
  { name: "Ravish Kumar", handle: "@ravishndtv", followers: 2_200_000 },
  { name: "Siddharth Varadarajan", handle: "@svaradarajan", followers: 920_000 },
  { name: "Sucheta Dalal", handle: "@suchetadalal", followers: 380_000 },
];

const HEADLINES = [
  "Port expansion threatens mangrove ecosystem; locals file PIL against coastal clearance",
  "Villagers block coal transport convoy near mine site; police lathi-charge reported",
  "Parliament opposition demands JPC into conglomerate's finances amid LIC exposure",
  "Fisherfolk protest dredging operations; livelihoods at risk, 12-day sit-in enters new phase",
  "Environment ministry notice over clearance violations triggers stop-work order",
  "Solar park land dispute escalates; pastoralists move court against eviction",
  "Investigative report alleges policy capture in airport privatisation shortlist",
  "Tribal council rejects FRA waiver; sends memorandum to district collector",
  "SBI, LIC exposure questioned after short-seller report update; stocks slide 4%",
  "Coastal erosion linked to port dredging; marine study cited in NGT petition",
  "Defamation case filed against critic; press-freedom groups react, call it SLAPP suit",
  "High court stays land acquisition order in SEZ expansion over consent-deficit findings",
  "Local sarpanch meeting rejects township clearance over water-rights concerns",
  "Journalists allege newsroom pressure; three editors exit in 48 hours",
  "Environmental activists file PIL over elephant corridor fragmentation",
  "Opposition corners govt over airport contract; demands tabling of CAG report",
  "Foreign investor group flags governance concerns; ESG rating placed on watch",
  "Tribal rally in Jharkhand demands scrapping of mine expansion MoU",
  "Coast guard called after fisherfolk clash with contractor vessels",
  "Power plant emissions exceed NAAQS limits for third consecutive quarter",
  "Community radio broadcast raises pollution alarm; district admin orders inquiry",
  "Twitter thread goes viral alleging preferential treatment in coal block allocation",
  "Forest rights group publishes dossier on displaced families in mining belt",
  "Labour union strike halts port loading operations; 4,000 containers delayed",
  "New affidavit in court reveals compensation shortfall for relocated families",
  "RTI response contradicts official claims on environmental clearances",
  "Local body unanimously votes against industrial township expansion",
  "Social media campaign demands judicial probe into aerocity land allocation",
  "Short-seller publishes follow-up report; questions offshore fund structure",
  "Women-led protest marches to district HQ over contaminated water supplies",
  "LinkedIn post from ex-employee alleges safety-audit irregularities",
  "Environmental clearance challenged in green tribunal; hearing next week",
  "Indigenous community files continental rights complaint at UN forum",
  "Regulator seeks clarification on related-party transactions disclosure",
  "Fisherfolk cooperative announces indefinite protest at port entrance",
  "Academic study links coal dust to respiratory illness spike in nearby villages",
  "Photo-journalist documents displacement camps; post shared 80K+ times",
];

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1586810724476-c294fb7ac01b?auto=format&fit=crop&w=640&q=70",
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=640&q=70",
  "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=640&q=70",
  "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=640&q=70",
  "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=640&q=70",
  "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=640&q=70",
  "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=640&q=70",
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=640&q=70",
  "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=640&q=70",
  "https://images.unsplash.com/photo-1569470451072-68314f596aec?auto=format&fit=crop&w=640&q=70",
];

const VIDEO_URLS = [
  "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-heights-in-a-sunset-26070-small.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-partying-happily-4640-small.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-small.mp4",
];

function seeded(i) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
const pick = (arr, i) => arr[Math.floor(seeded(i) * arr.length)];
const randInt = (min, max, i) => Math.floor(seeded(i) * (max - min + 1)) + min;

export function generatePosts(count = 620, seed = 0) {
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
      : severity === "high" ? 0.6 + seeded(s) * 0.2
      : severity === "medium" ? 0.35 + seeded(s) * 0.2
      : 0.08 + seeded(s) * 0.25;
    const hoursAgo = randInt(0, 30 * 24, s + 7);
    const ts = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
    const hasMedia = seeded(s + 8);
    const hasVideo = hasMedia > 0.88;
    const hasImage = !hasVideo && hasMedia > 0.4;
    const imageUrl = hasImage || hasVideo ? IMAGE_URLS[s % IMAGE_URLS.length] : null;
    const videoUrl = hasVideo ? VIDEO_URLS[s % VIDEO_URLS.length] : null;
    const shares = severity === "critical" ? randInt(500, 80000, s + 9) : severity === "high" ? randInt(100, 8000, s + 9) : randInt(5, 800, s + 9);
    const reach = Math.round((author.followers || 10000) * (0.02 + seeded(s + 10) * 0.15));
    posts.push({
      id: `p_${s}`,
      content: HEADLINES[s % HEADLINES.length] + " — " + site.name,
      author: author.name,
      handle: author.handle,
      author_followers: author.followers || 10000,
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
      has_video: hasVideo,
      has_image: hasImage,
      image_url: imageUrl,
      video_url: videoUrl,
      shares,
      reach,
    });
  }
  return posts;
}

const POSTS_CACHE = generatePosts(620);

// Filter predicate applied to any derived computation
function applyFilters(list, params = {}) {
  let out = list;
  if (params.severity) out = out.filter((x) => x.severity === params.severity);
  if (params.venture) out = out.filter((x) => x.venture === params.venture);
  if (params.category) out = out.filter((x) => x.category === params.category);
  if (params.subcategory) out = out.filter((x) => x.subcategory === params.subcategory);
  if (params.state) out = out.filter((x) => x.state === params.state);
  if (params.platform && params.platform !== "all") out = out.filter((x) => x.platform === params.platform);
  if (params.q) {
    const q = String(params.q).toLowerCase();
    out = out.filter((x) =>
      (x.content || "").toLowerCase().includes(q) ||
      (x.author || "").toLowerCase().includes(q) ||
      (x.site || "").toLowerCase().includes(q) ||
      (x.handle || "").toLowerCase().includes(q)
    );
  }
  if (params.window) {
    const ms =
      params.window === "24h" ? 86400 * 1000 :
      params.window === "48h" ? 86400 * 2 * 1000 :
      params.window === "7d" ? 86400 * 7 * 1000 :
      params.window === "30d" ? 86400 * 30 * 1000 :
      null;
    if (ms) out = out.filter((x) => (Date.now() - new Date(x.timestamp).getTime()) <= ms);
  }
  if (params.start) out = out.filter((x) => new Date(x.timestamp) >= new Date(params.start));
  if (params.end) out = out.filter((x) => new Date(x.timestamp) <= new Date(params.end + "T23:59:59"));
  return out;
}

// ---------- Computations (filter-aware) ----------

function kpis(posts) {
  const critical = posts.filter((p) => p.severity === "critical").length;
  const high = posts.filter((p) => p.severity === "high").length;
  const activeSites = new Set(posts.map((p) => p.site)).size;
  const avgSent = posts.length ? posts.reduce((a, p) => a + p.sentiment, 0) / posts.length : 0;
  const last24 = posts.filter((p) => Date.now() - new Date(p.timestamp).getTime() < 24 * 3600 * 1000).length;
  return {
    total_posts: posts.length,
    critical_count: critical,
    high_risk_count: high,
    active_sites: activeSites,
    avg_sentiment: Number(avgSent.toFixed(2)),
    posts_last_24h: last24,
  };
}

function locations(posts) {
  const byState = {}, bySite = {};
  posts.forEach((p) => {
    if (!byState[p.state]) {
      const c = STATE_COORDS[p.state] || [22, 80];
      byState[p.state] = { state: p.state, lat: c[0], lng: c[1], signals: 0, critical: 0, risk: 0, sentiment: 0, sites: new Set() };
    }
    const s = byState[p.state];
    s.signals++;
    if (p.severity === "critical") s.critical++;
    s.risk += p.risk_score;
    s.sentiment += p.sentiment;
    s.sites.add(p.site);

    if (!bySite[p.site]) {
      const base = STATE_COORDS[p.state] || [22, 80];
      bySite[p.site] = {
        id: p.site, site: p.site, state: p.state, venture: p.venture,
        lat: base[0] + (seeded(p.site.length) - 0.5) * 1.5,
        lng: base[1] + (seeded(p.site.length + 1) - 0.5) * 1.5,
        signals: 0, critical: 0, risk: 0,
      };
    }
    bySite[p.site].signals++;
    if (p.severity === "critical") bySite[p.site].critical++;
    bySite[p.site].risk += p.risk_score;
  });
  Object.values(bySite).forEach((s) => { s.avg_risk = Number((s.risk / s.signals).toFixed(2)); });
  return {
    states: Object.values(byState).map((s) => ({
      state: s.state, lat: s.lat, lng: s.lng, signals: s.signals, critical: s.critical,
      avg_risk: Number((s.risk / s.signals).toFixed(2)),
      sentiment: Number((s.sentiment / s.signals).toFixed(2)),
      sites: s.sites.size,
    })),
    sites: Object.values(bySite),
  };
}

function hierarchy(posts) {
  const tree = {};
  posts.forEach((p) => {
    if (!tree[p.venture]) tree[p.venture] = { name: p.venture, sites: {}, signals: 0, critical: 0, risk: 0 };
    const v = tree[p.venture];
    v.signals++; if (p.severity === "critical") v.critical++; v.risk += p.risk_score;
    if (!v.sites[p.site]) v.sites[p.site] = { name: p.site, state: p.state, categories: {}, signals: 0, critical: 0 };
    const s = v.sites[p.site];
    s.signals++; if (p.severity === "critical") s.critical++;
    if (!s.categories[p.category]) s.categories[p.category] = { name: p.category, subpoints: {}, signals: 0, critical: 0 };
    const c = s.categories[p.category];
    c.signals++; if (p.severity === "critical") c.critical++;
    if (!c.subpoints[p.subcategory]) c.subpoints[p.subcategory] = { name: p.subcategory, signals: 0, critical: 0 };
    c.subpoints[p.subcategory].signals++;
    if (p.severity === "critical") c.subpoints[p.subcategory].critical++;
  });
  return Object.values(tree).map((v) => ({
    ...v,
    avg_risk: Number((v.risk / Math.max(1, v.signals)).toFixed(2)),
    sites: Object.values(v.sites).map((s) => ({
      ...s,
      categories: Object.values(s.categories).map((c) => ({
        ...c,
        subpoints: Object.values(c.subpoints),
      })),
    })),
  })).sort((a, b) => b.critical - a.critical);
}

function platformDistribution(posts) {
  const c = {}; posts.forEach((p) => { c[p.platform] = (c[p.platform] || 0) + 1; });
  return Object.entries(c).map(([platform, count]) => ({ platform, count }));
}

function severityDistribution(posts) {
  const c = { critical: 0, high: 0, medium: 0, low: 0 };
  posts.forEach((p) => { c[p.severity]++; });
  const total = posts.length || 1;
  return SEVERITIES.map((s) => ({ severity: s, count: c[s], percent: Math.round((c[s] / total) * 100) }));
}

function categoryDistribution(posts) {
  const m = {};
  posts.forEach((p) => {
    if (!m[p.category]) m[p.category] = { category: p.category, signals: 0, critical: 0, risk: 0, subcategories: {} };
    const x = m[p.category];
    x.signals++; if (p.severity === "critical") x.critical++; x.risk += p.risk_score;
    if (!x.subcategories[p.subcategory]) x.subcategories[p.subcategory] = { name: p.subcategory, signals: 0, critical: 0, risk: 0 };
    x.subcategories[p.subcategory].signals++;
    if (p.severity === "critical") x.subcategories[p.subcategory].critical++;
    x.subcategories[p.subcategory].risk += p.risk_score;
  });
  return Object.values(m).map((c) => ({
    ...c,
    avg_risk: Number((c.risk / Math.max(1, c.signals)).toFixed(2)),
    subcategories: Object.values(c.subcategories).map((s) => ({
      ...s, avg_risk: Number((s.risk / Math.max(1, s.signals)).toFixed(2)),
    })).sort((a, b) => b.avg_risk - a.avg_risk),
  })).sort((a, b) => b.avg_risk - a.avg_risk);
}

function ventureDistribution(posts) {
  const m = {};
  posts.forEach((p) => {
    if (!m[p.venture]) m[p.venture] = { category: p.venture, signals: 0, critical: 0, risk: 0 };
    m[p.venture].signals++;
    if (p.severity === "critical") m[p.venture].critical++;
    m[p.venture].risk += p.risk_score;
  });
  return Object.values(m).map((v) => ({
    ...v, avg_risk: Number((v.risk / Math.max(1, v.signals)).toFixed(2)),
  })).sort((a, b) => b.avg_risk - a.avg_risk);
}

function sentimentTrend(posts) {
  const days = 30, out = [];
  for (let i = days - 1; i >= 0; i--) {
    const bucketStart = Date.now() - i * 86400 * 1000;
    const list = posts.filter((p) => {
      const diff = bucketStart - new Date(p.timestamp).getTime();
      return diff >= 0 && diff < 86400 * 1000;
    });
    const avg = list.length ? list.reduce((a, p) => a + p.sentiment, 0) / list.length : 0;
    const risk = list.length ? list.reduce((a, p) => a + p.risk_score, 0) / list.length : 0;
    const critical = list.filter((p) => p.severity === "critical").length;
    out.push({
      bucket: new Date(bucketStart).toISOString().slice(0, 10),
      posts: list.length, critical,
      avg_sentiment: Number(avg.toFixed(2)),
      avg_risk: Number(risk.toFixed(2)),
    });
  }
  return out;
}

function reportsArea(posts) {
  return locations(posts).states.sort((a, b) => b.critical - a.critical);
}

function ventureBreakdown(posts) {
  const m = {};
  posts.forEach((p) => {
    if (!m[p.venture]) m[p.venture] = { venture: p.venture, critical: 0, high: 0, medium: 0, low: 0, total: 0, sentiment: 0, risk: 0 };
    const v = m[p.venture];
    v[p.severity]++; v.total++; v.sentiment += p.sentiment; v.risk += p.risk_score;
  });
  return Object.values(m).map((v) => ({
    ...v,
    avg_sentiment: Number((v.sentiment / Math.max(1, v.total)).toFixed(2)),
    avg_risk: Number((v.risk / Math.max(1, v.total)).toFixed(2)),
  })).sort((a, b) => b.critical - a.critical);
}

function topSites(posts) {
  const m = {};
  posts.forEach((p) => {
    if (!m[p.site]) m[p.site] = { site: p.site, venture: p.venture, state: p.state, signals: 0, critical: 0, risk: 0, sentiment: 0 };
    m[p.site].signals++;
    if (p.severity === "critical") m[p.site].critical++;
    m[p.site].risk += p.risk_score; m[p.site].sentiment += p.sentiment;
  });
  return Object.values(m).map((s) => ({
    ...s,
    avg_risk: Number((s.risk / Math.max(1, s.signals)).toFixed(2)),
    avg_sentiment: Number((s.sentiment / Math.max(1, s.signals)).toFixed(2)),
  })).sort((a, b) => b.critical * 10 + b.avg_risk - (a.critical * 10 + a.avg_risk)).slice(0, 10);
}

// ---------- Router ----------

export function getMockData(key, params = {}) {
  const p = (key || "").toLowerCase();
  const filtered = applyFilters(POSTS_CACHE, params);

  if (p.includes("/kpis")) return kpis(filtered);
  if (p.includes("/posts/live")) return POSTS_CACHE.slice(0, params.limit || 30);
  if (p.includes("/posts")) {
    return filtered.slice(params.skip || 0, (params.skip || 0) + (params.limit || 100));
  }
  if (p.includes("/locations")) return locations(filtered);
  if (p.includes("/hierarchy")) return hierarchy(filtered);
  if (p.includes("/platform-distribution")) return platformDistribution(filtered);
  if (p.includes("/activity-distribution") || p.includes("/reports/severity")) return severityDistribution(filtered);
  if (p.includes("/reports/categories")) return CATEGORIES;
  if (p.includes("/reports/area")) return reportsArea(filtered);
  if (p.includes("/sentiment-trend")) return sentimentTrend(filtered);
  if (p === "category-distribution") return categoryDistribution(filtered);
  if (p === "venture-distribution") return ventureDistribution(filtered);
  if (p === "venture-breakdown") return ventureBreakdown(filtered);
  if (p === "top-sites") return topSites(filtered);
  if (p === "severity-distribution") return severityDistribution(filtered);
  return null;
}

export function getAllPosts() { return POSTS_CACHE; }

export function mockWebSocketEvent() {
  const post = POSTS_CACHE[Math.floor(Math.random() * POSTS_CACHE.length)];
  const newPost = { ...post, id: `live_${Date.now()}`, timestamp: new Date().toISOString() };
  if (Math.random() < 0.15) {
    return { event: "HIGH_RISK_ALERT", payload: { ...newPost, severity: "critical", risk_score: 0.92 } };
  }
  return { event: "NEW_POSTS", payload: [newPost] };
}

export const META = { VENTURES, STATES, CATEGORIES, SUBCATEGORIES, PLATFORMS, SEVERITIES };
