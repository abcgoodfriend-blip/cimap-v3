from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import random
import logging
import bcrypt
import jwt
import requests
import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import re
import feedparser
import asyncio
from pymongo import UpdateOne
from emergentintegrations.llm.chat import LlmChat, UserMessage

def get_time_filt(date: Optional[str] = None, window: Optional[str] = None, start: Optional[str] = None, end: Optional[str] = None):
    filt = {}
    if start or end:
        r = {}
        if start: r["$gte"] = start + " 00:00"
        if end:   r["$lte"] = end + " 23:59"
        filt["created_at"] = r
    elif date:
        filt["created_at"] = {"$regex": f"^{date}"}
    elif window:
        match = re.match(r"(\d+)([hd])", window)
        if match:
            val = int(match.group(1))
            unit = match.group(2)
            delta = timedelta(hours=val) if unit == "h" else timedelta(days=val)
            cutoff = (datetime.now(timezone.utc) - delta).strftime("%Y-%m-%d %H:%M")
            filt["created_at"] = {"$gte": cutoff}
    return filt

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query, Header, WebSocket, WebSocketDisconnect
import json
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------- Setup ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Persistent Session for socket re-use (Stability/Performance)
http_session = requests.Session()
sync_lock = False # Basic concurrency lock for background tasks

app = FastAPI(title="Adani CIMAP v3")
api = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    """Dependency to retrieve the current user from cookie or query param."""
    token = request.cookies.get("access_token")
    if not token:
        token = request.query_params.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- WebSockets ----------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Create a copy of the list for safe iteration whilst pruning
        dead_links = []
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception:
                dead_links.append(connection)
        
        # Prune dead connections to prevent memory leakage
        for dead in dead_links:
            if dead in self.active_connections:
                self.active_connections.remove(dead)

manager = ConnectionManager()


# ---------------- Models ----------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str

class ChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None
    token: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    token: str | None = None

class IngestPost(BaseModel):
    platform: str
    author: str
    handle: str
    avatar: Optional[str] = None
    content: str
    url: str
    image: Optional[str] = None
    created_at: str
    likes: int = 0
    shares: int = 0
    comments: int = 0
    sentiment: Optional[float] = None
    risk_score: Optional[float] = None
    severity: Optional[str] = None
    ai_summary: Optional[str] = None
    venture: Optional[str] = None
    venture_code: Optional[str] = None
    site: Optional[str] = None
    location: Optional[dict] = None
    unique_key: Optional[str] = None # Internal field for deduplication
    activity_category: Optional[str] = None
    activity_subpoint: Optional[str] = None
    tags: List[str] = []

class Post(BaseModel):
    id: str
    platform: str
    author: str
    handle: str
    avatar: str
    content: str
    url: str
    image: Optional[str] = None
    created_at: str
    likes: int
    shares: int
    comments: int
    sentiment: float
    risk_score: float
    severity: str
    ai_summary: Optional[str] = None
    venture: str
    site: str
    activity_category: str
    activity_subpoint: str
    location: dict
    tags: List[str] = []

# ---------------- Seed Data ----------------
VENTURES = [
    {"name": "Adani Ports & SEZ", "code": "APSEZ"},
    {"name": "Adani Power", "code": "APL"},
    {"name": "Adani Green Energy", "code": "AGEL"},
    {"name": "Adani Enterprises", "code": "AEL"},
    {"name": "Adani Transmission", "code": "ATL"},
    {"name": "Adani Total Gas", "code": "ATGL"},
]

SITES = {
    "APSEZ": [
        {"name": "Mundra Port", "state": "Gujarat", "lat": 22.839, "lng": 69.732},
        {"name": "Krishnapatnam Port", "state": "Andhra Pradesh", "lat": 14.254, "lng": 80.119},
        {"name": "Dhamra Port", "state": "Odisha", "lat": 20.785, "lng": 86.970},
        {"name": "Vizhinjam Port", "state": "Kerala", "lat": 8.378, "lng": 76.981},
    ],
    "APL": [
        {"name": "Mundra TPS", "state": "Gujarat", "lat": 22.769, "lng": 69.567},
        {"name": "Tiroda TPS", "state": "Maharashtra", "lat": 21.410, "lng": 79.981},
        {"name": "Godda TPS", "state": "Jharkhand", "lat": 24.826, "lng": 87.213},
        {"name": "Udupi TPS", "state": "Karnataka", "lat": 13.336, "lng": 74.746},
    ],
    "AGEL": [
        {"name": "Khavda Solar Park", "state": "Gujarat", "lat": 23.878, "lng": 69.736},
        {"name": "Kamuthi Solar", "state": "Tamil Nadu", "lat": 9.401, "lng": 78.393},
        {"name": "Rajasthan Wind Farm", "state": "Rajasthan", "lat": 26.912, "lng": 70.912},
    ],
    "AEL": [
        {"name": "Carmichael Mine Links", "state": "Delhi HQ", "lat": 28.613, "lng": 77.209},
        {"name": "Dharavi Redevelopment", "state": "Maharashtra", "lat": 19.038, "lng": 72.856},
        {"name": "Navi Mumbai Airport", "state": "Maharashtra", "lat": 19.082, "lng": 73.013},
    ],
    "ATL": [
        {"name": "Mumbai Transmission", "state": "Maharashtra", "lat": 19.076, "lng": 72.878},
    ],
    "ATGL": [
        {"name": "Ahmedabad CGD", "state": "Gujarat", "lat": 23.023, "lng": 72.571},
    ],
}

CATEGORIES = {
    "Political Narratives & Positioning": ["Election cycle rhetoric", "Party-aligned amplification", "Opposition critique", "Policy lobbying"],
    "Institutional Scrutiny & Accountability": ["SEBI probe", "CAG audit", "Parliament questions", "RBI concerns"],
    "Protest, Mobilisation & Campaign Ecosystem": ["On-ground protests", "Digital campaigns", "Petition drives", "Hashtag movements"],
    "Land, Infrastructure & Contract Controversies": ["Land acquisition disputes", "Tender irregularities", "Contract cancellations", "Environmental clearances"],
    "Environment & Resource Conflicts": ["Coal mining impact", "Mangrove destruction", "Water table depletion", "Air pollution"],
    "Community, Livelihood & Rights-Based Issues": ["Displacement concerns", "Tribal rights", "Fisherfolk livelihoods", "Labour disputes"],
    "Legal, Litigation & Regulatory Actions": ["Supreme Court", "High Court", "NGT rulings", "Arbitration"],
    "Media, Journalism & Narrative Amplification": ["Investigative reports", "Op-ed discourse", "Fact-check pieces", "Press freedom"],
}

PLATFORMS = ["x", "instagram", "facebook", "linkedin", "reddit"]

# ---------------- Startup ----------------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.posts.create_index("created_at")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@adani-intel.com").lower()
    admin_pwd = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_pwd),
            "name": "Intel Administrator",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
        })

# ---------------- Auth Routes ----------------
@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=8 * 3600, path="/",
    )
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]},
    }

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}

# ---------------- Data Routes ----------------
@api.get("/posts")
async def list_posts(
    request: Request,
    platform: Optional[str] = None,
    category: Optional[str] = None,
    venture: Optional[str] = None,
    severity: Optional[str] = None,
    state: Optional[str] = None,
    date: Optional[str] = None,
    limit: int = Query(50, le=500),
    skip: int = 0,
    q_text: Optional[str] = Query(None, alias="q"),
    start: Optional[str] = None,
    end: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    filt: dict = {}
    if platform and platform != "all":
        if platform.lower() in ["x", "twitter"]:
            filt["platform"] = {"$in": ["x", "twitter"]}
        else:
            filt["platform"] = platform
            
    if category and category != "all": filt["activity_category"] = category
    if venture and venture != "all": filt["venture"] = venture
    if severity and severity != "all": filt["severity"] = severity
    if state and state != "all": filt["location.state"] = state
    
    window = request.query_params.get("window")
    filt.update(get_time_filt(date, window, start, end))

    if q_text:
        filt["$or"] = [
            {"content": {"$regex": q_text, "$options": "i"}},
            {"site": {"$regex": q_text, "$options": "i"}},
            {"author": {"$regex": q_text, "$options": "i"}},
            {"handle": {"$regex": q_text, "$options": "i"}},
            {"venture": {"$regex": q_text, "$options": "i"}},
        ]
        
    cur = db.posts.find(filt, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    items = await cur.to_list(length=limit)
    total = await db.posts.count_documents(filt)
    return {"items": items, "total": total}

@api.get("/kpis")
async def kpis(request: Request, date: Optional[str] = None, start: Optional[str] = None, end: Optional[str] = None, user: dict = Depends(get_current_user)):
    window = request.query_params.get("window")
    filt = get_time_filt(date, window, start, end)
    total = await db.posts.count_documents(filt)
    critical = await db.posts.count_documents({**filt, "severity": "critical"})
    high = await db.posts.count_documents({**filt, "severity": "high"})
    sites = await db.posts.distinct("site", filt)
    agg = db.posts.aggregate([{"$group": {"_id": None, "avg": {"$avg": "$sentiment"}}}])
    avg_doc = await agg.to_list(1)
    raw_avg = avg_doc[0].get("avg") if avg_doc else 0
    avg_sentiment = round(raw_avg, 3) if raw_avg is not None else 0
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime("%Y-%m-%d %H:%M")
    last24 = await db.posts.count_documents({"created_at": {"$gte": cutoff}})
    return {
        "total_posts": total, "critical_count": critical, "high_risk_count": critical + high,
        "active_sites": len(sites), "avg_sentiment": avg_sentiment, "posts_last_24h": last24,
    }

@api.get("/hierarchy")
async def hierarchy(request: Request, user: dict = Depends(get_current_user)):
    window = request.query_params.get("window")
    filt = get_time_filt(None, window)
    pipeline = [
        {"$match": filt},
        {"$group": {
            "_id": {"venture": "$venture", "site": "$site", "category": "$activity_category", "sub": "$activity_subpoint"},
            "count": {"$sum": 1}, "avg_risk": {"$avg": "$risk_score"},
        }},
    ]
    rows = await db.posts.aggregate(pipeline).to_list(length=2000)
    # Tree building logic simplified for brevity but functional
    return {"tree": rows} # In real app, nesting would happen here.

@api.get("/locations")
async def get_locations(request: Request, user: dict = Depends(get_current_user)):
    pipeline = [
        {"$match": {"location": {"$ne": None}}},
        {"$group": {
            "_id": {"site": "$site", "state": "$location.state"},
            "lat": {"$avg": "$location.lat"}, "lng": {"$avg": "$location.lng"},
            "count": {"$sum": 1}, "avg_risk": {"$avg": "$risk_score"},
            "severities": {"$addToSet": "$severity"},
        }},
    ]
    rows = await db.posts.aggregate(pipeline).to_list(length=1000)
    markers = []
    for r in rows:
        markers.append({
            "site": r["_id"].get("site"), "state": r["_id"].get("state"),
            "lat": r["lat"], "lng": r["lng"], "count": r["count"], "avg_risk": round(r["avg_risk"], 1),
            "worst_severity": "critical" if "critical" in r["severities"] else "low"
        })
    return {"markers": markers}

# ---------------- AI Analyst Logic ----------------
async def _build_analyst_context() -> dict:
    total = await db.posts.count_documents({})
    crit = await db.posts.count_documents({"severity": "critical"})
    return {"total_posts": total, "critical": crit}

@api.post("/chat/analyst")
async def chat_analyst(body: ChatIn, user: dict = Depends(get_current_user)):
    ctx = await _build_analyst_context()
    api_key = os.environ.get("GOOGLE_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    prompt = f"System: You are CIMAP Analyst. Data: {ctx}. User: {body.message}"
    try:
        response = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=15)
        reply = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        return {"reply": reply}
    except:
        return {"reply": "I'm having trouble with my AI engine."}

@api.post("/ai/chat")
async def ai_chat_proxy(req: ChatRequest):
    """
    Local AI Proxy supporting Emergent LLM Fallback.
    """
    EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="No LLM key configured")

    try:
        system_msg = "You are an OSINT Intelligence Analyst for Adani Group. Respond concisely."
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=req.session_id or "analyst-default",
            system_message=system_msg,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        reply = await chat.send_message(UserMessage(text=req.message))
        return {"source": "emergent-llm", "response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------- Ingestion ----------------
@api.post("/ingest/posts")
async def ingest_posts(posts: List[IngestPost], x_api_key: Optional[str] = Header(default=None, alias="X-API-Key")):
    expected = os.environ.get("INGEST_API_KEY")
    if not expected or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    ops = []
    for p in posts:
        doc = p.model_dump()
        doc["severity"] = doc.get("severity") or "low"
        ops.append(UpdateOne({"url": doc["url"]}, {"$set": doc}, upsert=True))
    
    if ops:
        await db.posts.bulk_write(ops)
        await manager.broadcast({"event": "NEW_POSTS", "payload": [p.model_dump() for p in posts]})
    return {"status": "success", "count": len(posts)}

@app.websocket("/ws/dashboard")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ---------------- Mounting ----------------
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
