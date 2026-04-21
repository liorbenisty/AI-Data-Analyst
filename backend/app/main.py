import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import CHARTS_DIR
from app.routes.upload import router as upload_router
from app.routes.chat import router as chat_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Data Analyst",
    description="An AI-powered data analysis agent using Mistral + LangGraph",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/charts", StaticFiles(directory=str(CHARTS_DIR)), name="charts")

app.include_router(upload_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    from app.agent.nodes import _read_env_file
    env = _read_env_file()
    key = env.get("MISTRAL_API_KEY", "")
    has_key = bool(key and len(key) > 8)
    return {
        "status": "ok",
        "service": "AI Data Analyst",
        "mistral_configured": has_key,
    }
