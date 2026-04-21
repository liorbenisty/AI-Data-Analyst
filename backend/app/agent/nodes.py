from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.services.file_handler import get_dataset_summary, get_file_metadata
from app.services.executor import execute_code
from app.agent.state import AgentState


def _read_env_file():
    """Read .env file directly to avoid any caching issues."""
    from pathlib import Path
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    env_vars = {}
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                env_vars[key.strip()] = value.strip()
    return env_vars


def get_llm():
    from langchain_mistralai import ChatMistralAI

    env = _read_env_file()
    api_key = env.get("MISTRAL_API_KEY", "")
    model = env.get("MISTRAL_MODEL", "mistral-large-latest")
    return ChatMistralAI(
        model=model,
        api_key=api_key,
        temperature=0,
        max_retries=2,
    )


SYSTEM_PROMPT = """\
You are an expert data analyst. You are given a dataset and a user question.
Your job is to write Python code using pandas and matplotlib to answer the question.

Rules:
- The dataframe is already loaded as `df`. Do NOT load the file yourself.
- Use `print()` to output any numerical results, tables, or answers.
- For visualizations, use matplotlib (plt). The chart will be saved automatically.
- Always add clear titles, labels, and legends to charts.
- Use clean, readable formatting for printed output.
- Write ONLY the analysis code. No imports needed (pandas, matplotlib, numpy are pre-imported).
- Do NOT use plt.show(). The chart is saved automatically.
- If the question asks for a visualization, create one. If it asks for numbers, print them.
- If you can answer with both a chart AND printed numbers, do both.

Return ONLY the Python code, no markdown, no explanation, no backticks.\
"""


def inspect_data(state: AgentState) -> dict:
    """Node 1: Load dataset info and build context for the LLM."""
    file_id = state["file_id"]
    dataset_summary = get_dataset_summary(file_id)

    meta = get_file_metadata(file_id)
    file_path = meta["file_path"] if meta else ""

    return {
        "dataset_info": dataset_summary,
        "file_path": file_path,
    }


def generate_code(state: AgentState) -> dict:
    """Node 2: Ask Mistral to write Python code to answer the user's question."""
    llm = get_llm()

    messages = state.get("messages", [])
    dataset_info = state.get("dataset_info", "")
    error = state.get("error", "")

    user_question = ""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage) or (hasattr(msg, "type") and msg.type == "human"):
            user_question = msg.content
            break

    prompt_parts = [
        f"Dataset information:\n{dataset_info}",
        f"\nUser question: {user_question}",
    ]

    if error:
        prompt_parts.append(
            f"\nPrevious code attempt failed with this error:\n{error}\n"
            "Please fix the code and try again."
        )

    llm_messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content="\n".join(prompt_parts)),
    ]

    response = llm.invoke(llm_messages)
    code = response.content.strip()

    if code.startswith("```"):
        lines = code.splitlines()
        lines = [l for l in lines if not l.strip().startswith("```")]
        code = "\n".join(lines)

    return {
        "generated_code": code,
        "error": "",
    }


def execute_code_node(state: AgentState) -> dict:
    """Node 3: Run the generated code in a sandboxed subprocess."""
    code = state.get("generated_code", "")
    file_path = state.get("file_path", "")

    if not code:
        return {
            "execution_result": "",
            "chart_path": "",
            "error": "No code was generated",
        }

    result = execute_code(code, file_path)

    return {
        "execution_result": result["stdout"],
        "chart_path": result["chart_path"],
        "error": result["error"],
    }


def evaluate_result(state: AgentState) -> dict:
    """Node 4: Check execution result and decide whether to retry."""
    error = state.get("error", "")
    retry_count = state.get("retry_count", 0)

    if error:
        return {"retry_count": retry_count + 1}

    return {}


def generate_response(state: AgentState) -> dict:
    """Node 5: Ask Mistral to summarize the results in natural language."""
    llm = get_llm()

    execution_result = state.get("execution_result", "")
    chart_path = state.get("chart_path", "")
    error = state.get("error", "")
    generated_code = state.get("generated_code", "")

    messages = state.get("messages", [])
    user_question = ""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage) or (hasattr(msg, "type") and msg.type == "human"):
            user_question = msg.content
            break

    prompt_parts = [f"User question: {user_question}"]

    if error:
        prompt_parts.append(
            f"\nThe analysis code failed after multiple attempts."
            f"\nLast error: {error}"
            f"\nPlease explain what went wrong and suggest how the user might rephrase their question."
        )
    else:
        prompt_parts.append(f"\nCode output:\n{execution_result}")
        if chart_path:
            prompt_parts.append("\nA chart was also generated and will be displayed.")
        prompt_parts.append(
            "\nPlease provide a clear, concise summary of these results. "
            "Highlight key findings and insights. Use bullet points if appropriate."
        )

    llm_messages = [
        SystemMessage(content="You are a helpful data analyst assistant. Summarize analysis results clearly and concisely."),
        HumanMessage(content="\n".join(prompt_parts)),
    ]

    response = llm.invoke(llm_messages)

    return {
        "messages": [AIMessage(content=response.content)],
    }
