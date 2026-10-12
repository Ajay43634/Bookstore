"""
Seed the database with realistic fixture data.
Run with: docker compose run --rm backend uv run python -m bookstore.scripts.seed
"""
from datetime import date
from decimal import Decimal

import bcrypt
from sqlalchemy import select

from bookstore.shared.db import SessionLocal
from bookstore.modules.authors.models import Author
from bookstore.modules.books.models import Book, BookAuthor, BookGenre, Genre
from bookstore.modules.series.models import Series


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def seed() -> None:
    db = SessionLocal()
    try:
        # Idempotent — skip if already seeded
        if db.scalar(select(Author)):
            print("Database already seeded — skipping.")
            return

        # ── Genres ──────────────────────────────────────────────────────────
        genres: dict[str, Genre] = {}
        for name in ["Fantasy", "Science Fiction", "Mystery", "Historical Fiction", "Romance"]:
            g = Genre(name=name)
            db.add(g)
            genres[name] = g

        # ── Authors ─────────────────────────────────────────────────────────
        elena = Author(
            name="Elena Marsh",
            email="elena@bookstore.dev",
            password_hash=_hash("password123"),
            bio="Elena Marsh writes epic fantasy rooted in folklore and forgotten histories.",
            nationality="British",
            date_of_birth=date(1982, 4, 15),
        )
        james = Author(
            name="James Okafor",
            email="james@bookstore.dev",
            password_hash=_hash("password123"),
            bio="James Okafor blends hard science fiction with West African mythology.",
            nationality="Nigerian",
            date_of_birth=date(1975, 9, 3),
        )
        sofia = Author(
            name="Sofia Chen",
            email="sofia@bookstore.dev",
            password_hash=_hash("password123"),
            bio="Sofia Chen crafts labyrinthine mysteries set in contemporary Asia.",
            nationality="Singaporean",
            date_of_birth=date(1990, 1, 28),
        )
        db.add_all([elena, james, sofia])
        db.flush()  # get IDs before creating books

        # ── Series ───────────────────────────────────────────────────────────
        ember = Series(
            name="The Ember Chronicles",
            description="An epic fantasy trilogy following the fall and rise of the Ember Throne.",
        )
        db.add(ember)
        db.flush()

        # ── Books ────────────────────────────────────────────────────────────
        crown = Book(
            title="The Ember Crown",
            description="The heir to a dying kingdom must forge alliances across a fractured continent.",
            publish_date=date(2019, 3, 12),
            price=Decimal("14.99"),
            thumbnail="https://picsum.photos/seed/embercrown/300/450",
            series_id=ember.id,
            volume_number=1,
            created_by_author_id=elena.id,
        )
        war = Book(
            title="The Ember War",
            description="The alliance fractures as an ancient enemy rises from the ash-fields.",
            publish_date=date(2021, 6, 8),
            price=Decimal("15.99"),
            thumbnail="https://picsum.photos/seed/emberwar/300/450",
            series_id=ember.id,
            volume_number=2,
            created_by_author_id=elena.id,
        )
        stars = Book(
            title="Stars Without Number",
            description="A generation ship carrying the last humans reaches a star that should not exist.",
            publish_date=date(2020, 11, 1),
            price=Decimal("13.99"),
            thumbnail="https://picsum.photos/seed/starswn/300/450",
            created_by_author_id=james.id,
        )
        ivory = Book(
            title="The Ivory Mask",
            description="A jade merchant is found dead in Singapore, and the detective assigned knows him too well.",
            publish_date=date(2022, 2, 14),
            price=Decimal("12.99"),
            thumbnail="https://picsum.photos/seed/ivorymask/300/450",
            created_by_author_id=sofia.id,
        )
        echoes = Book(
            title="Echoes of Tomorrow",
            description="Two physicists discover that every decision echoes forward in time — and one echo wants to be heard.",
            publish_date=date(2018, 7, 22),
            price=Decimal("11.99"),
            thumbnail="https://picsum.photos/seed/echoes/300/450",
            created_by_author_id=james.id,
        )
        garden = Book(
            title="The Last Garden",
            description="In an empire on the edge of collapse, a royal botanist hides a revolution in her greenhouse.",
            publish_date=date(2023, 9, 5),
            price=Decimal("16.99"),
            thumbnail="https://picsum.photos/seed/lastgarden/300/450",
            created_by_author_id=elena.id,
        )
        db.add_all([crown, war, stars, ivory, echoes, garden])
        db.flush()

        # ── BookAuthor (M:N) ─────────────────────────────────────────────────
        # Ember Chronicles: co-authored by Elena & James
        db.add_all([
            BookAuthor(book_id=crown.id, author_id=elena.id),
            BookAuthor(book_id=crown.id, author_id=james.id),
            BookAuthor(book_id=war.id,   author_id=elena.id),
            BookAuthor(book_id=war.id,   author_id=james.id),
            # Single-author books
            BookAuthor(book_id=stars.id,  author_id=james.id),
            BookAuthor(book_id=ivory.id,  author_id=sofia.id),
            BookAuthor(book_id=echoes.id, author_id=james.id),
            BookAuthor(book_id=garden.id, author_id=elena.id),
        ])

        # ── BookGenre (M:N) ──────────────────────────────────────────────────
        db.add_all([
            BookGenre(book_id=crown.id,   genre_id=genres["Fantasy"].id),
            BookGenre(book_id=war.id,     genre_id=genres["Fantasy"].id),
            BookGenre(book_id=stars.id,   genre_id=genres["Science Fiction"].id),
            BookGenre(book_id=ivory.id,   genre_id=genres["Mystery"].id),
            BookGenre(book_id=echoes.id,  genre_id=genres["Science Fiction"].id),
            BookGenre(book_id=garden.id,  genre_id=genres["Fantasy"].id),
            BookGenre(book_id=garden.id,  genre_id=genres["Historical Fiction"].id),
        ])

        db.commit()
        print("Seeded: 3 authors, 5 genres, 1 series, 6 books (M:N links included).")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
