"""
Export the FastAPI OpenAPI schema to backend/openapi.json and enrich it with
basic example request payloads and response examples so frontend developers
have a concrete reference.

Usage:
    uv run python backend/tools/export_openapi.py

Outputs:
    - backend/openapi.json (pretty-printed)
"""
from __future__ import annotations

import json
import os
from typing import Any, Dict


def example_from_schema(schema: Dict[str, Any]) -> Any:
    """Create a naive example value from a JSON Schema-like dict.

    This is best-effort and meant to give frontend devs a starting point. It
    honors default/example/enum when present and otherwise returns a type-based
    placeholder. Handles nested objects/arrays recursively.
    """
    if not isinstance(schema, dict):
        return None

    # Prefer explicit example/default/enum when available
    if "example" in schema:
        return schema["example"]
    if "default" in schema:
        return schema["default"]
    if "enum" in schema and isinstance(schema["enum"], list) and schema["enum"]:
        return schema["enum"][0]

    schema_type = schema.get("type")

    # Support combined types like ["string", "null"] by picking the first
    if isinstance(schema_type, list) and schema_type:
        schema_type = schema_type[0]

    if schema_type == "object" or (schema_type is None and "properties" in schema):
        props = schema.get("properties", {})
        required = set(schema.get("required", []) or [])
        obj: Dict[str, Any] = {}
        for key, sub in props.items():
            obj[key] = example_from_schema(sub)
        # If no properties declared, return a generic example
        return obj if obj else {"key": "value"}

    if schema_type == "array":
        item_schema = schema.get("items", {})
        return [example_from_schema(item_schema)]

    if schema_type == "integer":
        return 123
    if schema_type == "number":
        return 123.45
    if schema_type == "boolean":
        return True
    if schema_type == "string":
        fmt = schema.get("format")
        if fmt == "date-time":
            return "2025-01-01T12:34:56Z"
        if fmt == "date":
            return "2025-01-01"
        if fmt == "email":
            return "user@example.com"
        if fmt == "uuid":
            return "00000000-0000-0000-0000-000000000000"
        if fmt == "uri":
            return "https://example.com/resource"
        return schema.get("title") or schema.get("description") or "string"

    # Fallback when type is unspecified
    return "string"


def enrich_with_examples(openapi: Dict[str, Any]) -> Dict[str, Any]:
    paths: Dict[str, Any] = openapi.get("paths", {})
    for path, path_item in paths.items():
        if not isinstance(path_item, dict):
            continue
        for method, operation in path_item.items():
            if method.lower() not in {"get", "post", "put", "patch", "delete"}:
                continue
            if not isinstance(operation, dict):
                continue

            # Request examples for JSON bodies
            request_body = operation.get("requestBody")
            if isinstance(request_body, dict):
                content = request_body.get("content", {})
                app_json = content.get("application/json")
                if isinstance(app_json, dict):
                    schema = app_json.get("schema")
                    if isinstance(schema, dict):
                        app_json.setdefault("example", example_from_schema(schema))

            # Simple response examples for 200/201 JSON
            responses = operation.get("responses", {})
            if isinstance(responses, dict):
                for status_code in ("200", "201"):
                    resp = responses.get(status_code)
                    if isinstance(resp, dict):
                        content = resp.get("content", {})
                        app_json = content.get("application/json")
                        if isinstance(app_json, dict):
                            schema = app_json.get("schema")
                            if isinstance(schema, dict):
                                app_json.setdefault("example", example_from_schema(schema))

    return openapi


def main() -> None:
    # Ensure we run from repository root or backend folder
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    backend_dir = os.path.join(repo_root, "backend")

    # Import app lazily so environment side-effects (dotenv) run as they do in dev
    # Import path is relative to backend root
    import sys

    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    from app.main import app  # type: ignore

    openapi = app.openapi()
    openapi = enrich_with_examples(openapi)

    out_path = os.path.join(backend_dir, "openapi.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(openapi, f, ensure_ascii=False, indent=2)

    print(f"Wrote OpenAPI schema with examples to {out_path}")


if __name__ == "__main__":
    main()
