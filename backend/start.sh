#!/bin/sh
uv run alembic upgrade head
uv run uvicorn bookstore.main:app --host 0.0.0.0 --port "${PORT:-4000}"
