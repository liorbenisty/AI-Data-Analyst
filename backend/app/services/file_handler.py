import uuid
import json
from pathlib import Path
from datetime import datetime

import pandas as pd

from app.config import UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB


class FileValidationError(Exception):
    pass


def validate_file(filename: str, file_size: int) -> None:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise FileValidationError(
            f"File type '{ext}' not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise FileValidationError(
            f"File too large ({file_size / 1024 / 1024:.1f} MB). Max: {MAX_FILE_SIZE_MB} MB"
        )


def save_file(filename: str, content: bytes) -> dict:
    file_id = uuid.uuid4().hex[:12]
    ext = Path(filename).suffix.lower()
    stored_name = f"{file_id}{ext}"
    file_path = UPLOAD_DIR / stored_name

    file_path.write_bytes(content)

    schema = extract_schema(file_path)

    metadata = {
        "file_id": file_id,
        "original_name": filename,
        "stored_name": stored_name,
        "file_path": str(file_path),
        "size_bytes": len(content),
        "uploaded_at": datetime.now().isoformat(),
        "schema": schema,
    }

    meta_path = UPLOAD_DIR / f"{file_id}.meta.json"
    meta_path.write_text(json.dumps(metadata, indent=2, default=str))

    return metadata


def extract_schema(file_path: Path) -> dict:
    df = load_dataframe(file_path)

    dtypes_map = {}
    for col, dtype in df.dtypes.items():
        dtype_str = str(dtype)
        if "int" in dtype_str:
            dtypes_map[col] = "integer"
        elif "float" in dtype_str:
            dtypes_map[col] = "float"
        elif "datetime" in dtype_str:
            dtypes_map[col] = "datetime"
        elif "bool" in dtype_str:
            dtypes_map[col] = "boolean"
        else:
            dtypes_map[col] = "string"

    sample_rows = df.head(5).to_dict(orient="records")

    null_counts = df.isnull().sum().to_dict()
    null_counts = {k: int(v) for k, v in null_counts.items()}

    return {
        "columns": list(df.columns),
        "dtypes": dtypes_map,
        "row_count": len(df),
        "column_count": len(df.columns),
        "sample_rows": sample_rows,
        "null_counts": null_counts,
    }


def load_dataframe(file_path: Path) -> pd.DataFrame:
    ext = file_path.suffix.lower()
    if ext == ".csv":
        return pd.read_csv(file_path)
    elif ext in (".xlsx", ".xls"):
        return pd.read_excel(file_path)
    else:
        raise FileValidationError(f"Unsupported file format: {ext}")


def get_file_metadata(file_id: str) -> dict | None:
    meta_path = UPLOAD_DIR / f"{file_id}.meta.json"
    if not meta_path.exists():
        return None
    return json.loads(meta_path.read_text())


def list_all_files() -> list[dict]:
    files = []
    for meta_path in sorted(UPLOAD_DIR.glob("*.meta.json"), reverse=True):
        meta = json.loads(meta_path.read_text())
        files.append({
            "file_id": meta["file_id"],
            "original_name": meta["original_name"],
            "size_bytes": meta["size_bytes"],
            "uploaded_at": meta["uploaded_at"],
            "row_count": meta["schema"]["row_count"],
            "column_count": meta["schema"]["column_count"],
            "columns": meta["schema"]["columns"],
        })
    return files


def get_dataset_summary(file_id: str) -> str:
    """Build a text summary of the dataset for the LLM context."""
    meta = get_file_metadata(file_id)
    if not meta:
        return "No dataset loaded."

    schema = meta["schema"]
    lines = [
        f"Dataset: {meta['original_name']}",
        f"Rows: {schema['row_count']}, Columns: {schema['column_count']}",
        "",
        "Columns and types:",
    ]

    for col in schema["columns"]:
        dtype = schema["dtypes"].get(col, "unknown")
        nulls = schema["null_counts"].get(col, 0)
        null_info = f" ({nulls} nulls)" if nulls > 0 else ""
        lines.append(f"  - {col}: {dtype}{null_info}")

    lines.append("")
    lines.append("Sample rows (first 5):")
    for i, row in enumerate(schema["sample_rows"][:5]):
        lines.append(f"  Row {i + 1}: {row}")

    return "\n".join(lines)
