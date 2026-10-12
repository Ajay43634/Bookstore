FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app

# Install deps first (better layer caching — no lock file required on first build)
COPY pyproject.toml ./
RUN uv sync --no-install-project

# Then copy source and sync again to install the project itself
COPY . .
RUN uv sync

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

EXPOSE 4000
CMD ["uv", "run", "uvicorn", "bookstore.main:app", "--host", "0.0.0.0", "--port", "4000", "--reload"]
