from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    file_id: str
    file_path: str
    dataset_info: str
    generated_code: str
    execution_result: str
    chart_path: str
    error: str
    retry_count: int
    conversation_history: list
    follow_up_suggestions: list
