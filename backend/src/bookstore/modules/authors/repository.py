from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from bookstore.modules.authors.models import Author
from bookstore.modules.books.models import BookAuthor


def list_authors(db: Session, page: int, page_size: int) -> tuple[list[Author], int]:
    total = db.scalar(select(func.count(Author.id))) or 0
    authors = list(
        db.scalars(
            select(Author)
            .order_by(Author.name)
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
    )
    return authors, total


def get_by_id(db: Session, author_id: int) -> Author | None:
    return db.scalar(
        select(Author)
        .where(Author.id == author_id)
        .options(
            selectinload(Author.book_associations).selectinload(BookAuthor.book)
        )
    )
