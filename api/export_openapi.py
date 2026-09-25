"""Write docs/api/openapi.json from the FastAPI app. Never edit that file by hand.

Run from anywhere: python api/export_openapi.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from bookit.main import app  # noqa: E402

out = HERE.parent / "docs" / "api" / "openapi.json"
out.write_text(json.dumps(app.openapi(), indent=2) + "\n", encoding="utf-8")
print(f"wrote {out.relative_to(HERE.parent)}")
