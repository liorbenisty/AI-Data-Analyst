def generate_suggestions(schema: dict, max_suggestions: int = 5) -> list[str]:
    """Generate data-aware question suggestions from a dataset schema."""
    columns = schema.get("columns", [])
    dtypes = schema.get("dtypes", {})

    numeric_cols = [c for c in columns if dtypes.get(c) in ("integer", "float")]
    categorical_cols = [c for c in columns if dtypes.get(c) == "string"]
    date_cols = [c for c in columns if dtypes.get(c) == "datetime"]

    suggestions = ["Show me a summary of the dataset"]

    if date_cols and numeric_cols:
        suggestions.append(
            f"Show the trend of {numeric_cols[0]} over {date_cols[0]}"
        )

    if numeric_cols and categorical_cols:
        suggestions.append(
            f"What is the average {numeric_cols[0]} by {categorical_cols[0]}?"
        )
        suggestions.append(
            f"Create a bar chart of {numeric_cols[0]} by {categorical_cols[0]}"
        )

    if numeric_cols:
        suggestions.append(
            f"Show the distribution of {numeric_cols[0]}"
        )

    if len(numeric_cols) >= 2:
        suggestions.append(
            f"What is the correlation between {numeric_cols[0]} and {numeric_cols[1]}?"
        )

    if categorical_cols:
        suggestions.append(
            f"What are the unique values in {categorical_cols[0]}?"
        )

    if len(numeric_cols) >= 1 and len(categorical_cols) >= 1:
        suggestions.append(
            f"What are the top 5 rows by {numeric_cols[0]}?"
        )

    return suggestions[:max_suggestions]
