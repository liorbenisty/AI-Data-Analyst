import subprocess
import sys
import uuid
import textwrap
from pathlib import Path

from app.config import CHARTS_DIR, CODE_EXECUTION_TIMEOUT


FORBIDDEN_IMPORTS = {
    "os", "subprocess", "shutil", "sys", "importlib",
    "socket", "http", "urllib", "requests", "ftplib",
    "smtplib", "ctypes", "signal", "multiprocessing",
    "threading", "asyncio", "webbrowser", "pathlib",
}

FORBIDDEN_CALLS = {
    "exec(", "eval(", "compile(", "__import__(",
    "open('/", "open(\"C:", "open('C:",
    "rmdir", "rmtree", "unlink",
}


def check_code_safety(code: str) -> str | None:
    """Return an error message if the code contains dangerous patterns."""
    for line in code.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            continue

        if stripped.startswith("import ") or stripped.startswith("from "):
            tokens = stripped.replace(",", " ").split()
            for token in tokens:
                if token in FORBIDDEN_IMPORTS:
                    return f"Forbidden import detected: '{token}'"

    for pattern in FORBIDDEN_CALLS:
        if pattern in code:
            return f"Forbidden call detected: '{pattern.rstrip('(')}'"

    return None


def execute_code(code: str, data_file_path: str) -> dict:
    """
    Execute Python code in a subprocess with timeout.
    Returns dict with: stdout, chart_path (if generated), error (if any).
    """
    safety_error = check_code_safety(code)
    if safety_error:
        return {"stdout": "", "chart_path": "", "error": safety_error}

    chart_filename = f"{uuid.uuid4().hex[:12]}.png"
    chart_path = CHARTS_DIR / chart_filename

    wrapper = textwrap.dedent(f"""\
        import pandas as pd
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import numpy as np

        DATA_FILE = r"{data_file_path}"
        CHART_PATH = r"{chart_path}"

        df = pd.read_csv(DATA_FILE) if DATA_FILE.endswith('.csv') else pd.read_excel(DATA_FILE)

        # --- User code starts ---
        {textwrap.indent(code, '        ').strip()}
        # --- User code ends ---

        if plt.get_fignums():
            plt.tight_layout()
            plt.savefig(CHART_PATH, dpi=150, bbox_inches='tight', facecolor='white')
            plt.close('all')
            print(f"__CHART__:{{CHART_PATH}}")
    """)

    try:
        result = subprocess.run(
            [sys.executable, "-c", wrapper],
            capture_output=True,
            text=True,
            timeout=CODE_EXECUTION_TIMEOUT,
            cwd=str(CHARTS_DIR),
        )

        stdout = result.stdout.strip()
        stderr = result.stderr.strip()

        detected_chart = ""
        output_lines = []
        for line in stdout.splitlines():
            if line.startswith("__CHART__:"):
                detected_chart = line.replace("__CHART__:", "").strip()
            else:
                output_lines.append(line)

        clean_stdout = "\n".join(output_lines).strip()

        if result.returncode != 0:
            return {
                "stdout": clean_stdout,
                "chart_path": "",
                "error": stderr or "Code execution failed with non-zero exit code",
            }

        if not detected_chart and chart_path.exists():
            detected_chart = str(chart_path)

        chart_result = ""
        if detected_chart and Path(detected_chart).exists():
            chart_result = chart_filename

        return {
            "stdout": clean_stdout,
            "chart_path": chart_result,
            "error": "",
        }

    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "chart_path": "",
            "error": f"Code execution timed out after {CODE_EXECUTION_TIMEOUT} seconds",
        }
    except Exception as e:
        return {
            "stdout": "",
            "chart_path": "",
            "error": f"Execution error: {str(e)}",
        }
