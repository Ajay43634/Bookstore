# BookStore — Vision

> A living document. Update Goals / Non-Goals as the product evolves; promote items from "Future Ideas" once you decide to build them.

## Summary
A web application where customers discover and purchase books, and authors manage their own catalog. The first version is intentionally small: one customer path (browse → cart → checkout) and one author path (register → dashboard → CRUD on books).

## Personas
- **Customer (guest)** — lands on the site, searches and filters, opens a book, optionally opens the author page, adds to cart, checks out.
- **Author (registered)** — registers, logs in, manages their books via a private dashboard.

## Goals (v1)
- Public landing page with search and filters: title, author, genre, publish date.
- Book detail page with description, price, authors, and — if applicable — other volumes in the same series.
- Author detail page listing their books and bio.
- Author registration and login.
- Author dashboard for create / update / delete of their own books.
- Many-to-many between Books and Authors.
- Chronology between Books via a Series concept (Volume 1, Volume 2, …).
- One-command local startup: `docker compose up`.

## Non-Goals (v1)
- Customer accounts, order history, real payments (checkout is mocked).
- Reviews, ratings, recommendations, wishlists.
- Email flows (verification, password reset, notifications).
- Admin role beyond "author manages own books".
- File uploads for thumbnails — accept image URLs in v1.
- Internationalization, multi-currency.

## Definition of Done for v1
A visitor opens the site, searches "fantasy", clicks a book, sees that it's Volume 2 of a series with a link to Volume 1 and the authors, adds it to the cart, and completes a mocked checkout. Separately, an author registers, logs in, adds a new book on their dashboard, and the visitor sees it on the next page refresh.

## Future Ideas (not promised)
- Real customer accounts and orders.
- Stripe (or similar) integration.
- Image upload for book thumbnails and author profile pictures.
- Reviews and 5-star ratings.
- Recommendations based on series and genre.
- Email verification and password reset.
- Admin role with moderation.
