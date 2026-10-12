# BookStore — Roadmap

The build is broken into **10 modules**, each with 1–3 **phases**. Phases are numbered globally so they line up with `status.md`. Within each module: backend first, then frontend, then integration. A phase is "Done" when its acceptance checks pass.

Everything below runs inside Docker. Python commands always go through `uv` — never `python <file>.py` directly.

---

## Module 1: Foundation
Set up the repo, Docker Compose, and a smoke-test path that proves the three services can talk to each other.

- **Phase 1.1 — Repo + Compose scaffold**
  - Create `frontend/`, `backend/`, `docs/`, `compose.yaml`, `compose.override.yaml`, `.env.example`.
  - Backend: a FastAPI app with `GET /api/v1/health` returning `{"ok": true}`. Container CMD is `uv run uvicorn bookstore.main:app --host 0.0.0.0 --port 4000 --reload`.
  - Frontend: a Next.js page (`app/page.tsx`) that fetches `/health` and shows "Backend OK".
  - **Acceptance**: `docker compose up` shows the frontend at `localhost:3000` displaying "Backend OK"; FastAPI's `/docs` is reachable on `localhost:4000/docs`; DB container is healthy.

- **Phase 1.2 — Dev experience**
  - Hot reload working for both frontend (Next.js dev server) and backend (`uvicorn --reload`) via `compose.override.yaml` bind mounts.
  - Document all dev commands as `docker compose run --rm backend uv <cmd>` and `docker compose run --rm frontend npm <cmd>` — never on host.
  - **Acceptance**: editing a `.py` or `.tsx` file refreshes the app without a container rebuild.

---

## Module 2: Data Layer
Wire up SQLAlchemy + Alembic, define the schema, and seed realistic data.

- **Phase 2.1 — SQLAlchemy models + Alembic migration**
  - Define `Author`, `Book`, `Series`, `Genre`, `BookAuthor`, `BookGenre` SQLAlchemy models per `architecture.md`. Models live under each feature module's `models.py`; a `shared/db.py` provides the engine and sessionmaker.
  - Initialize Alembic; generate the first migration via `docker compose run --rm backend uv run alembic revision --autogenerate -m "initial"`.
  - **Acceptance**: `docker compose run --rm backend uv run alembic upgrade head` succeeds; tables exist when inspected via `psql`.

- **Phase 2.2 — Seed script**
  - `src/bookstore/scripts/seed.py` populates ~3 authors, ~6 books (some co-authored, some in a series), ~5 genres.
  - Runnable via `docker compose run --rm backend uv run python -m bookstore.scripts.seed`.
  - **Acceptance**: seed runs to completion; querying via `psql` shows expected rows including M:N links and a series with ≥ 2 volumes.

---

## Module 3: Authors & Auth
Author identity is the only auth in the system.

- **Phase 3.1 — Authors read API**
  - `GET /api/v1/authors`, `GET /api/v1/authors/{id}` (includes book list).
  - Pydantic schemas for `AuthorPublic` and a paginated list response.
  - **Acceptance**: both endpoints return seeded data with the documented pagination shape; OpenAPI docs render correctly at `/docs`.

- **Phase 3.2 — Register & Login**
  - `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
  - JWT signed with `JWT_SECRET` via PyJWT; mirrored in httpOnly cookie.
  - Passwords hashed with passlib + bcrypt.
  - FastAPI dependency `get_current_author` in `shared/deps.py`.
  - **Acceptance**: a fresh account can register, log in, hit `/me`, log out — all from curl or the browser.

---

## Module 4: Books Module
Books CRUD with M:N authorship.

- **Phase 4.1 — Books read API**
  - `GET /api/v1/books` with filters: `q`, `author_id`, `genre`, `published_after`, `published_before`, `series_id`. Pagination included.
  - `GET /api/v1/books/{id}` returns book + authors + genres + series info.
  - **Acceptance**: filters compose correctly; combining `q=fantasy&author_id=X` returns the right intersection.

- **Phase 4.2 — Books write API**
  - `POST`, `PATCH`, `DELETE /api/v1/books[/{id}]` — author-only; only the creator (`created_by_author_id`) can edit/delete.
  - Endpoint accepts multiple authors (M:N) and multiple genres on create/update.
  - **Acceptance**: an author can create a book co-authored with another author; a third author cannot edit or delete it.

---

## Module 5: Series & Chronology
Volumes, ordered.

- **Phase 5.1 — Series endpoints**
  - `POST /api/v1/series`, `GET /api/v1/series/{id}` (returns ordered list of volumes).
  - Books can be assigned to a series with a `volume_number`; uniqueness enforced per series (DB constraint).
  - **Acceptance**: creating volumes 1, 2, 3 and fetching the series returns them in `volume_number` order; attempting to add a duplicate volume number errors cleanly.

---

## Module 6: Browse & Search (UI)
The customer landing page.

- **Phase 6.1 — Landing page**
  - Next.js Server Component renders the grid via `fetch(INTERNAL_API_BASE + "/books?...")`.
  - Client Component for the search bar (title) and filter panel (author, genre, date range) — uses `useRouter` to push filters into the URL.
  - Grid of `BookCard`s with title, thumbnail, price, primary author — themed with `--bg-elevated`, `--ink`, `--green-soft` tags.
  - Pagination control.
  - **Acceptance**: filters call the API and update the grid; empty states render; URL reflects the active filters (page is shareable).

---

## Module 7: Detail Pages (UI)
Customer drill-down.

- **Phase 7.1 — Book detail page**
  - Route: `app/books/[id]/page.tsx` (Server Component fetch).
  - Full book info, list of authors (links to author page), genre tags, series block with prev/next volume links (`SeriesVolumes` component).
  - "Add to cart" button uses Client Component + `useCart`.
  - **Acceptance**: visiting a book in a series shows neighbouring volumes; clicking an author goes to their page.

- **Phase 7.2 — Author detail page**
  - Route: `app/authors/[id]/page.tsx`.
  - Bio, profile picture, list of books by this author.
  - **Acceptance**: clicking through from a book lands on the right author with their books listed.

---

## Module 8: Cart & Checkout
Mocked — no payments.

- **Phase 8.1 — Cart**
  - `useCart` hook backed by `localStorage`. Add / remove / update quantity.
  - Cart icon in the header shows item count.
  - **Acceptance**: the cart survives a page refresh.

- **Phase 8.2 — Checkout (mock)**
  - `/checkout` page collects name, email, shipping address.
  - `POST /api/v1/checkout` returns a fake order id; cart clears on success.
  - **Acceptance**: completing checkout shows a confirmation screen with the fake order id.

---

## Module 9: Author Dashboard
The other half of the app.

- **Phase 9.1 — Auth UI**
  - `/register`, `/login`, `/logout` routes. `dashboard/layout.tsx` checks the auth cookie and redirects to `/login` if missing.
  - **Acceptance**: trying to open `/dashboard` while logged out redirects to login.

- **Phase 9.2 — Dashboard CRUD UI**
  - `/dashboard` lists the logged-in author's books with edit / delete actions.
  - `/dashboard/books/new` form (multi-select for co-authors and genres; optional series + volume number).
  - `/dashboard/books/[id]/edit` form.
  - **Acceptance**: an author can add a book and see it on the public landing page on next refresh.

---

## Module 10: Polish & QA
The "make it feel finished" pass.

- **Phase 10.1 — Errors, loading, empty states**
  - Next.js `error.tsx` and `loading.tsx` at the right route levels.
  - Friendly messages on empty search results, empty cart, etc.
  - Apply the warm-earthly palette consistently — no stray pure-white surfaces or pure-black text.

- **Phase 10.2 — End-to-end test pass**
  - Manually walk both flows (customer + author) against a freshly seeded DB.
  - Fix anything that breaks.
  - **Acceptance**: the v1 Definition of Done in `vision.md` is achievable end-to-end without manual workarounds.

---

## What's Not in the Roadmap (Yet)
File uploads for thumbnails, real payments, customer accounts, reviews, email flows, recommendations. Track these in `vision.md` under "Future Ideas"; promote them into a new module when they become real.
