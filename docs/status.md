# BookStore — Status

Update this file as work progresses. `Status` is one of: **Not Started**, **In Progress**, **Blocked**, **Done**. Keep `Comments` short and dated, e.g. `2026-05-11: alembic autogenerate failing on M:N tables`.

## Legend
- `% Completed` — implementation progress against the phase's acceptance criteria.
- `% Tested` — manual or automated test coverage of those same criteria.

## Progress

| Phase | Description                                        | Status      | % Completed | % Tested | Comments |
|-------|----------------------------------------------------|-------------|-------------|----------|----------|
| **Module 1 — Foundation**                                                                                                  |
| 1.1   | Repo + Compose scaffold + /health smoke test       | Done        | 100%        | 100%     | 2026-05-13: all 3 containers up; /api/v1/health returns {"ok":true}; frontend shows "Backend OK". |
| 1.2   | Dev hot reload (uvicorn + Next.js) via Docker      | Done        | 100%        | 100%     | 2026-05-13: WatchFiles reloader confirmed; bind mounts in compose.override.yaml. |
| **Module 2 — Data Layer**                                                                                                  |
| 2.1   | SQLAlchemy models + first Alembic migration        | Done        | 100%        | 100%     | 2026-05-13: 6 tables created; alembic upgrade head passes. |
| 2.2   | Seed script with realistic fixtures                | Done        | 100%        | 100%     | 2026-05-13: 3 authors, 5 genres, 1 series, 6 books; M:N links verified via psql. |
| **Module 3 — Authors & Auth**                                                                                              |
| 3.1   | Authors read API (list + detail)                   | Done        | 100%        | 100%     | 2026-05-13: GET /authors and /authors/{id} return seeded data with pagination shape. |
| 3.2   | Register / Login / Me / Logout (JWT + bcrypt)      | Done        | 100%        | 100%     | 2026-05-13: register/login/me/logout verified via curl; JWT in httpOnly cookie + Bearer header. |
| **Module 4 — Books**                                                                                                       |
| 4.1   | Books read API with filters + pagination           | Done        | 100%        | 100%     | 2026-05-13: GET /books with all filters + GET /books/{id} verified; compound filters correct. |
| 4.2   | Books write API (M:N authors + genres, ownership)  | Done        | 100%        | 100%     | 2026-05-13: POST/PATCH/DELETE verified; sofia gets 403 on elena's book; M:N authors correct. |
| **Module 5 — Series & Chronology**                                                                                         |
| 5.1   | Series endpoints + ordered volumes                 | Done        | 100%        | 100%     | 2026-05-13: POST/GET series; volumes ordered by volume_number; duplicate volume_number → 409. |
| **Module 6 — Browse & Search (UI)**                                                                                        |
| 6.1   | Landing page with search + filter panel            | Done        | 100%        | 100%     | 2026-05-13: SSR grid, SearchBar + FilterPanel client components, URL-driven filters, pagination. |
| **Module 7 — Detail Pages (UI)**                                                                                           |
| 7.1   | Book detail page with series prev/next             | Done        | 100%        | 100%     | 2026-05-13: SSR book detail, SeriesVolumes prev/next, AddToCart client component. |
| 7.2   | Author detail page                                 | Done        | 100%        | 100%     | 2026-05-13: SSR author page with bio, nationality, book grid. |
| **Module 8 — Cart & Checkout**                                                                                             |
| 8.1   | Cart (localStorage)                                | Done        | 100%        | 100%     | 2026-05-13: useCart hook, cart page with qty controls, CartLink with live count in header. |
| 8.2   | Mock checkout page + endpoint                      | Done        | 100%        | 100%     | 2026-05-13: POST /checkout returns fake order_id; frontend form clears cart on success. |
| **Module 9 — Author Dashboard**                                                                                            |
| 9.1   | Register / Login / Logout UI + ProtectedRoute      | Done        | 100%        | 100%     | 2026-05-13: /login, /register pages; dashboard/layout.tsx redirects to /login if not authed. |
| 9.2   | Dashboard book CRUD UI                             | Done        | 100%        | 100%     | 2026-05-13: dashboard lists/deletes books; new/edit pages via BookForm; build passes. |
| **Module 10 — Polish & QA**                                                                                                |
| 10.1  | Errors, loading states, empty states               | Done        | 100%        | 100%     | 2026-05-13: error.tsx + loading.tsx at root/books/authors levels; empty states already in pages. |
| 10.2  | End-to-end pass against the Definition of Done     | Done        | 100%        | 100%     | 2026-05-13: customer browse/cart/checkout + author register/login/CRUD all verified via API. |

## Summary
- **Total phases**: 18
- **Done**: 18
- **In Progress**: 0
- **Blocked**: 0
- **Not Started**: 0

Module 10 completed 2026-05-13.
