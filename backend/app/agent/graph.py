from langgraph.graph import StateGraph, END

from app.config import MAX_RETRIES
from app.agent.state import AgentState
from app.agent.nodes import (
    inspect_data,
    generate_code,
    execute_code_node,
    evaluate_result,
    generate_response,
)


def should_retry(state: AgentState) -> str:
    """Conditional edge: retry code generation or move to response."""
    error = state.get("error", "")
    retry_count = state.get("retry_count", 0)

    if error and retry_count < MAX_RETRIES:
        return "retry"
    return "respond"


def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("inspect_data", inspect_data)
    graph.add_node("generate_code", generate_code)
    graph.add_node("execute_code", execute_code_node)
    graph.add_node("evaluate_result", evaluate_result)
    graph.add_node("generate_response", generate_response)

    graph.set_entry_point("inspect_data")

    graph.add_edge("inspect_data", "generate_code")
    graph.add_edge("generate_code", "execute_code")
    graph.add_edge("execute_code", "evaluate_result")

    graph.add_conditional_edges(
        "evaluate_result",
        should_retry,
        {
            "retry": "generate_code",
            "respond": "generate_response",
        },
    )

    graph.add_edge("generate_response", END)

    return graph


agent = build_graph().compile()
