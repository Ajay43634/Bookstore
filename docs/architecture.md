# BookStore — Architecture

> This file is the source of truth for *how* the code is organized. Update it when conventions change; do not let code drift from it.

## Style
A **modular monolith** with a **layered backend**. Three services orchestrated by Docker Compose. No packages are installed on the host — every command runs inside a container, and every Python invocation goes through **`uv`**.

## Services
| Service   | Purpose                   | Tech                                                                          | Port |
|-----------|---------------------------|-------------------------------------------------------------------------------|------|
| frontend  | Customer + author UI      | Next.js 15 (App Router) + TypeScript + TailwindCSS                            | 3000 |
| backend   | REST API + business logic | Python 3.14 + FastAPI + SQLAlchemy 2 + Alembic + Pydantic v2, managed by `uv` | 4000 |
| db        | Persistent storage        | PostgreSQL 16                                                                 | 5432 |

> These are the defaults — swap them if you have a strong preference, but every section below assumes this stack.

## Repository Layout
```
bookstore/
├── compose.yaml
├── compose.override.yaml         # dev-only hot reload mounts
├── .env.example
├── frontend/                     # Next.js app
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── src/...
├── backend/                      # Python + FastAPI
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   └── src/bookstore/...
└── docs/
    ├── vision.md
    ├── architecture.md
    ├── roadmap.md
    └── status.md
```

---

## Backend (Python + FastAPI, managed by uv)

### Why this stack
- **Python 3.14** — latest stable; deferred annotations and better error messages.
- **FastAPI** — async, type-driven, automatic OpenAPI docs at `/docs`.
- **Pydantic v2** — validation and DTOs.
- **SQLAlchemy 2.0** (ORM) + **Alembic** (migrations) — explicit, mature, Pythonic.
- **`uv`** — fast, deterministic dependency management. Single tool for venv, install, run, lock.

### Layout
Code is organized **by feature module first, then by layer**. Every module has the same internal shape, so Claude Code can scaffold a new one by copying an existing one.

```
backend/src/bookstore/
├── main.py                              # FastAPI app composition; mounts module routers
├── modules/
│   ├── authors/
│   │   ├── __init__.py                  # public exports
│   │   ├── routes.py                    # APIRouter — transport
│   │   ├── service.py                   # business logic; no FastAPI/HTTP imports
│   │   ├── repository.py                # SQLAlchemy queries — only layer that imports the session
│   │   ├── schemas.py                   # Pydantic DTOs (input + output)
│   │   └── models.py                    # SQLAlchemy ORM models
│   ├── books/        (same shape)
│   ├── series/       (same shape)
│   ├── auth/         (register, login, JWT issuing)
│   └── cart/         (checkout endpoint only in v1)
└── shared/
    ├── db.py                            # SQLAlchemy engine + sessionmaker
    ├── settings.py                      # pydantic-settings, loads from env
    ├── security.py                      # password hashing + JWT sign/verify
    ├── deps.py                          # FastAPI dependencies (get_db, get_current_author)
    ├── errors.py                        # Exception classes + global handlers
    └── logging.py
```

### Layering Rules (mandatory)
1. **`routes.py`** declares the `APIRouter` and endpoint functions. Endpoint functions take Pydantic schemas in their signature, validate via FastAPI, and call the service. Routes never import SQLAlchemy.
2. **`service.py`** contains business logic. It never imports FastAPI types (no `Request`, no `HTTPException` — raise domain exceptions defined in `shared/errors.py`). It never imports SQLAlchemy sessions or models.
3. **`repository.py`** is the only place that imports SQLAlchemy models and the DB session. It exposes typed functions, not a Session.
4. **Cross-module calls** go service → service, through the module's `__init__.py` public surface.
5. **Pydantic schemas** are the contract; SQLAlchemy models are an implementation detail of the repository.

### Why this layering
- Easy to test: services are pure functions over typed inputs.
- Easy to refactor: swapping SQLAlchemy for something else touches only repositories.
- Easy for Claude Code: a clear convention to follow when generating a new module.

### Running with uv (mandatory pattern)
Every Python command runs through `uv` *inside* the container. There is no `python main.py` anywhere — that pattern is banned by convention.

| Action            | Command                                                                                          |
|-------------------|--------------------------------------------------------------------------------------------------|
| Install deps      | `docker compose run --rm backend uv sync`                                                        |
| Add a dep         | `docker compose run --rm backend uv add fastapi`                                                 |
| Add a dev dep     | `docker compose run --rm backend uv add --dev pytest`                                            |
| Run the server    | `uv run uvicorn bookstore.main:app --host 0.0.0.0 --port 4000 --reload` (the Dockerfile's CMD)   |
| Run a migration   | `docker compose run --rm backend uv run alembic upgrade head`                                    |
| Create a migration| `docker compose run --rm backend uv run alembic revision --autogenerate -m "msg"`                |
| Seed the DB       | `docker compose run --rm backend uv run python -m bookstore.scripts.seed`                        |
| Run tests         | `docker compose run --rm backend uv run pytest`                                                  |

### `pyproject.toml` (sketch)
```toml
[project]
name = "bookstore"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = [
  "fastapi>=0.115",
  "uvicorn[standard]>=0.32",
  "sqlalchemy>=2.0",
  "alembic>=1.13",
  "psycopg[binary]>=3.2",
  "pydantic>=2.9",
  "pydantic-settings>=2.5",
  "passlib[bcrypt]>=1.7",
  "pyjwt>=2.9",
  "python-multipart>=0.0.12",
]

[dependency-groups]
dev = ["pytest>=8", "httpx>=0.27", "ruff>=0.7"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/bookstore"]
```

### Backend Dockerfile (sketch)
```dockerfile
FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app

# Install deps first for layer caching
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# Then the source
COPY . .
RUN uv sync --frozen

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

EXPOSE 4000
CMD ["uv", "run", "uvicorn", "bookstore.main:app", "--host", "0.0.0.0", "--port", "4000", "--reload"]
```

---

## Data Model

### Entities
| Entity     | Key Fields                                                                                                       |
|------------|------------------------------------------------------------------------------------------------------------------|
| Author     | id, name, email (unique), password_hash, profile_picture, bio, nationality, date_of_birth                        |
| Book       | id, title, description, publish_date, price, thumbnail, series_id?, volume_number?, created_by_author_id         |
| BookAuthor | book_id, author_id (composite PK) — explicit M:N join                                                            |
| Series     | id, name, description                                                                                            |
| Genre      | id, name (unique)                                                                                                |
| BookGenre  | book_id, genre_id (composite PK) — explicit M:N join                                                             |

Genres are a separate table rather than a string array so filtering is fast and consistent.

### Relationships
- **Book ↔ Author**: many-to-many via `BookAuthor`.
- **Book ↔ Genre**: many-to-many via `BookGenre`.
- **Book → Series**: many-to-one. `book.series_id` is nullable. `book.volume_number` is nullable but unique *within* a series.
- **Book → Author (ownership)**: every book has one `created_by_author_id` — the only author allowed to edit/delete it via the dashboard, regardless of whether they are also listed as a co-author.

### Chronology via Series
To find the chronological neighbours of a book:
```sql
SELECT * FROM books
WHERE series_id = :series_id
ORDER BY volume_number ASC;
```
The frontend renders "Previous volume" / "Next volume" links based on position. No cycles, no self-referencing FK.

---

## API
- Base: `/api/v1`
- Format: JSON.
- Pagination: `?page=1&page_size=20` → `{ "data": [...], "page": 1, "page_size": 20, "total": N }`.
- Filter (landing page): `GET /api/v1/books?q=&author_id=&genre=&published_after=&published_before=&series_id=`.
- Auth: JWT in `Authorization: Bearer …` header AND mirrored in an httpOnly cookie for browser sessions.
- Interactive docs: FastAPI auto-generates `/docs` (Swagger) and `/redoc`.

### Route Map (v1)
| Method | Path                          | Auth   | Module  |
|--------|-------------------------------|--------|---------|
| GET    | /api/v1/books                 | public | books   |
| GET    | /api/v1/books/{id}            | public | books   |
| POST   | /api/v1/books                 | author | books   |
| PATCH  | /api/v1/books/{id}            | owner  | books   |
| DELETE | /api/v1/books/{id}            | owner  | books   |
| GET    | /api/v1/authors               | public | authors |
| GET    | /api/v1/authors/{id}          | public | authors |
| POST   | /api/v1/auth/register         | public | auth    |
| POST   | /api/v1/auth/login            | public | auth    |
| POST   | /api/v1/auth/logout           | author | auth    |
| GET    | /api/v1/auth/me               | author | auth    |
| GET    | /api/v1/series/{id}           | public | series  |
| POST   | /api/v1/series                | author | series  |
| POST   | /api/v1/checkout              | public | cart    |

---

## Frontend (Next.js 15, App Router)

### Layout
```
frontend/src/
├── app/
│   ├── layout.tsx                       # Root layout, applies theme
│   ├── globals.css                      # Tailwind directives + design tokens
│   ├── page.tsx                         # Landing
│   ├── books/[id]/page.tsx              # Book detail
│   ├── authors/[id]/page.tsx            # Author detail
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── dashboard/
│       ├── layout.tsx                   # Protected (redirects if not author)
│       ├── page.tsx                     # Author's book list
│       ├── books/new/page.tsx
│       └── books/[id]/edit/page.tsx
├── components/
│   ├── BookCard.tsx
│   ├── SearchBar.tsx
│   ├── FilterPanel.tsx
│   ├── SeriesVolumes.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── api/                             # one file per backend module, typed
│   │   ├── books.ts
│   │   ├── authors.ts
│   │   ├── series.ts
│   │   └── auth.ts
│   └── http.ts                          # fetch wrapper, attaches credentials
└── hooks/
    ├── useAuth.ts
    └── useCart.ts                       # cart lives in localStorage in v1
```

### Server vs Client Components
- Default to **Server Components** for read-only pages (landing, book detail, author detail). They can `fetch` the backend directly during SSR.
- Use **Client Components** (`"use client"`) only where state or browser APIs are needed: search filters, cart, dashboard forms, auth context.

### Frontend Dockerfile (sketch)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

---

## Design System: Warm & Earthly

A muted, natural palette: cream backgrounds, dusty blue, sage green, warm wheat yellow. Nothing saturated; everything desaturated and warm-leaning.

### Color Tokens
| Token              | Hex       | Use                                                  |
|--------------------|-----------|------------------------------------------------------|
| `--bg-base`        | `#FBF7EF` | Page background — warm cream                          |
| `--bg-elevated`    | `#F3ECDE` | Cards, panels — slightly deeper sand                  |
| `--bg-sunken`      | `#E8DFCD` | Dividers, subtle borders                              |
| `--ink`            | `#2C2A22` | Primary text — warm near-black                        |
| `--ink-muted`      | `#6F6553` | Secondary text — warm brown-gray                      |
| `--ink-faint`      | `#A89F89` | Hints, placeholders                                   |
| `--blue-soft`      | `#C9DCE4` | Light dusty blue — chip backgrounds, hovers           |
| `--blue`           | `#8FB3C2` | Primary accent — buttons, links                       |
| `--blue-deep`      | `#5C8A9C` | Hover/active state for primary                        |
| `--green-soft`     | `#D2DEBC` | Light sage — success chips, secondary tags            |
| `--green`          | `#A4BD86` | Secondary accent — author tags, "in stock"            |
| `--green-deep`     | `#748B5C` | Hover state for secondary                             |
| `--yellow-soft`    | `#F0DFA8` | Light wheat — highlight, "featured" ribbon            |
| `--yellow`         | `#DEC677` | Warm gold — selected state, ratings                   |
| `--yellow-deep`    | `#B89E4A` | Hover state for yellow                                |

### Use-case mapping
- **Backgrounds**: `--bg-base` for the page; `--bg-elevated` for `BookCard` and form panels; `--bg-sunken` for hairline borders.
- **Primary action** (e.g. *Add to Cart*, *Save*): solid `--blue` bg, `--ink` text, `--blue-deep` on hover.
- **Secondary action** (e.g. *Filter*, *View Author*): solid `--green` bg or outlined `--green-deep` border.
- **Tags / chips**: genre tags use `--green-soft` bg + `--green-deep` text; author chips use `--blue-soft` bg + `--blue-deep` text.
- **Highlights**: "Featured" or "Volume N" badges use `--yellow-soft` bg + `--yellow-deep` text.
- **Text**: `--ink` for body, `--ink-muted` for metadata (publish date, author bios), `--ink-faint` for placeholders.

### `globals.css` (sketch)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-base: #FBF7EF;
  --bg-elevated: #F3ECDE;
  --bg-sunken: #E8DFCD;
  --ink: #2C2A22;
  --ink-muted: #6F6553;
  --ink-faint: #A89F89;
  --blue-soft: #C9DCE4;
  --blue: #8FB3C2;
  --blue-deep: #5C8A9C;
  --green-soft: #D2DEBC;
  --green: #A4BD86;
  --green-deep: #748B5C;
  --yellow-soft: #F0DFA8;
  --yellow: #DEC677;
  --yellow-deep: #B89E4A;
}

body {
  background: var(--bg-base);
  color: var(--ink);
  font-family: ui-serif, Georgia, "Iowan Old Style", "Apple Garamond", serif;
  /* a serif body fits the "bookish, earthly" feel — swap if you prefer sans */
}
```

### `tailwind.config.ts` (sketch)
```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:    { base: "var(--bg-base)", elevated: "var(--bg-elevated)", sunken: "var(--bg-sunken)" },
        ink:   { DEFAULT: "var(--ink)", muted: "var(--ink-muted)", faint: "var(--ink-faint)" },
        blue:  { soft: "var(--blue-soft)", DEFAULT: "var(--blue)", deep: "var(--blue-deep)" },
        green: { soft: "var(--green-soft)", DEFAULT: "var(--green)", deep: "var(--green-deep)" },
        yellow:{ soft: "var(--yellow-soft)", DEFAULT: "var(--yellow)", deep: "var(--yellow-deep)" },
      },
    },
  },
} satisfies Config;
```

### Design intent (so Claude Code doesn't drift)
- Prefer **rounded but not pill-shaped** corners (`rounded-md` / `rounded-lg`).
- Subtle shadows or none — earthly palettes look better with crisp edges and the sand background doing the layering work.
- **No pure white** anywhere — always `--bg-base` or lighter cream.
- **No pure black** for text — always `--ink`.
- Borders: 1px `--bg-sunken`. Almost never a darker outline.
- Hover transitions soft (200ms).

---

## Docker / Compose

`compose.yaml` (the contract — names and ports are stable across environments):
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: bookstore
      POSTGRES_PASSWORD: bookstore
      POSTGRES_DB: bookstore
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bookstore"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql+psycopg://bookstore:bookstore@db:5432/bookstore
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-me}
      PORT: 4000
    ports:
      - "4000:4000"
    # CMD defined in Dockerfile uses `uv run uvicorn ...`

  frontend:
    build: ./frontend
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_BASE: http://localhost:4000/api/v1
      INTERNAL_API_BASE: http://backend:4000/api/v1   # for server components
    ports:
      - "3000:3000"

volumes:
  db-data:
```

`compose.override.yaml` (dev) adds source-code bind mounts so file changes hot-reload without a rebuild. Production-mode is `docker compose -f compose.yaml up` (no override).

### Container rules
- Every command — `uv sync`, `alembic upgrade`, `pytest`, `npm install` — runs via `docker compose run --rm <service> <cmd>` or `docker compose exec <service> <cmd>`. Nothing is installed on the host.
- Python invocations always go through `uv run`. The string `python main.py` does not appear anywhere in this codebase.
- The Python virtualenv (`/app/.venv`) and `node_modules` live in named volumes inside their containers so they survive bind mounts.

---

## What This Architecture Deliberately Avoids
- No message queue, no Redis, no separate auth service.
- No GraphQL.
- No microservices.
- No CDN, no object storage — book thumbnails are URLs only in v1.
- No SSG / ISR tricks — plain SSR + client-side fetching is enough for v1.
