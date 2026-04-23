from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from pathlib import Path
import os
import logging
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
EXTERNAL_API = os.environ.get(
    "EXTERNAL_API_URL", "https://adani-backend-h3ij.onrender.com/api"
)

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    token: str | None = None


@api_router.get("/")
async def root():
    return {"service": "osint-dashboard-proxy", "status": "ok"}


@api_router.post("/ai/chat")
async def ai_chat(req: ChatRequest):
    """
    AI Analyst Chat:
    1. Try external backend /chat/analyst (Gemini 1.5 Pro) if a token is provided
    2. Fallback to Emergent LLM (Claude Sonnet 4.5) for demo / offline operation
    """
    # 1. Try external endpoint if token present
    if req.token:
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                r = await client.post(
                    f"{EXTERNAL_API}/chat/analyst",
                    headers={"Authorization": f"Bearer {req.token}"},
                    json={"message": req.message, "session_id": req.session_id or "default"},
                )
                if r.status_code == 200:
                    data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {"response": r.text}
                    return {"source": "external", "response": data.get("response") or data.get("reply") or str(data)}
        except Exception as e:
            logger.warning(f"External chat failed, falling back: {e}")

    # 2. Fallback: Emergent LLM
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="No LLM key configured")

    try:
        system_msg = (
            "You are an OSINT Intelligence Analyst specializing in corporate risk, "
            "public perception, and emerging threats across social media, news and "
            "digital ecosystems for Adani Group's ventures. Respond concisely with "
            "executive-grade insights: key risks, narrative themes, recommended actions. "
            "Keep answers short, data-forward, bullet-styled when helpful."
        )
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=req.session_id or "analyst-default",
            system_message=system_msg,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        reply = await chat.send_message(UserMessage(text=req.message))
        return {"source": "emergent-llm", "response": reply}
    except Exception as e:
        logger.exception("Emergent LLM fallback failed")
        raise HTTPException(status_code=500, detail=f"AI analyst unavailable: {e}")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
