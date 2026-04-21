import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from app.agent.graph import agent, memory
from app.services.file_handler import get_file_metadata

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"])
_executor = ThreadPoolExecutor(max_workers=4)


class ChatRequest(BaseModel):
    message: str
    file_id: str
    session_id: str = ""


class ResetRequest(BaseModel):
    session_id: str


def _run_agent(message: str, file_id: str, file_path: str, session_id: str) -> dict:
    initial_state = {
        "messages": [HumanMessage(content=message)],
        "file_id": file_id,
        "file_path": file_path,
        "dataset_info": "",
        "generated_code": "",
        "execution_result": "",
        "chart_path": "",
        "error": "",
        "retry_count": 0,
    }

    config = {"configurable": {"thread_id": session_id}} if session_id else None
    result = agent.invoke(initial_state, config)

    ai_message = ""
    for msg in reversed(result.get("messages", [])):
        if hasattr(msg, "type") and msg.type == "ai":
            ai_message = msg.content
            break
        elif hasattr(msg, "content") and not isinstance(msg, HumanMessage):
            ai_message = msg.content
            break

    return {
        "answer": ai_message,
        "chart_path": result.get("chart_path", ""),
        "code": result.get("generated_code", ""),
        "execution_result": result.get("execution_result", ""),
        "error": result.get("error", ""),
        "follow_up_suggestions": result.get("follow_up_suggestions", []),
    }


@router.post("/chat")
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if not request.file_id.strip():
        raise HTTPException(status_code=400, detail="File ID is required")

    meta = get_file_metadata(request.file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")

    loop = asyncio.get_event_loop()
    try:
        result = await loop.run_in_executor(
            _executor,
            _run_agent,
            request.message,
            request.file_id,
            meta["file_path"],
            request.session_id,
        )
    except Exception as e:
        logger.exception("Agent execution failed")
        raise HTTPException(status_code=500, detail=str(e))

    return result


@router.post("/chat/reset")
async def reset_session(request: ResetRequest):
    if not request.session_id.strip():
        raise HTTPException(status_code=400, detail="Session ID is required")

    try:
        if hasattr(memory, 'storage'):
            keys_to_delete = [
                k for k in memory.storage if request.session_id in str(k)
            ]
            for k in keys_to_delete:
                del memory.storage[k]
    except Exception as e:
        logger.warning("Failed to clear session memory: %s", e)

    return {"status": "ok"}
