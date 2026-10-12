from datetime import date

from sqlalchemy.orm import Session

from bookstore.modules.books import repository
from bookstore.modules.books.schemas import (
    AuthorRef,
    BookCreate,
    BookDetail,
    BookSummary,
    BookUpdate,
    GenreRef,
    PaginatedBooks,
    SeriesRef,
)
from bookstore.shared.errors import ForbiddenError, NotFoundError


def _to_summary(book) -> BookSummary:  # type: ignore[no-untyped-def]
    return BookSummary(
        id=book.id,
        title=book.title,
        description=book.description,
        publish_date=book.publish_date,
        price=book.price,
        thumbnail=book.thumbnail,
        authors=[AuthorRef(id=a.author.id, name=a.author.name) for a in book.author_associations],
        genres=[GenreRef(id=g.genre.id, name=g.genre.name) for g in book.genre_associations],
    )


def list_books(
    db: Session,
    page: int,
    page_size: int,
    q: str | None = None,
    author_id: int | None = None,
    genre: str | None = None,
    published_after: date | None = None,
    published_before: date | None = None,
    series_id: int | None = None,
) -> PaginatedBooks:
    books, total = repository.list_books(
        db, page, page_size,
        q=q, author_id=author_id, genre=genre,
        published_after=published_after, published_before=published_before,
        series_id=series_id,
    )
    return PaginatedBooks(
        data=[_to_summary(b) for b in books],
        page=page,
        page_size=page_size,
        total=total,
    )


def _to_detail(book) -> BookDetail:  # type: ignore[no-untyped-def]
    return BookDetail(
        id=book.id,
        title=book.title,
        description=book.description,
        publish_date=book.publish_date,
        price=book.price,
        thumbnail=book.thumbnail,
        volume_number=book.volume_number,
        authors=[AuthorRef(id=a.author.id, name=a.author.name) for a in book.author_associations],
        genres=[GenreRef(id=g.genre.id, name=g.genre.name) for g in book.genre_associations],
        series=SeriesRef(id=book.series.id, name=book.series.name) if book.series else None,
    )


def create_book(db: Session, data: BookCreate, current_author_id: int) -> BookDetail:
    book = repository.create(
        db,
        title=data.title,
        price=data.price,
        created_by_author_id=current_author_id,
        description=data.description,
        publish_date=data.publish_date,
        thumbnail=data.thumbnail,
        series_id=data.series_id,
        volume_number=data.volume_number,
        author_ids=data.author_ids,
        genre_ids=data.genre_ids,
    )
    book = repository.get_by_id(db, book.id)  # reload with associations
    return _to_detail(book)


def update_book(db: Session, book_id: int, data: BookUpdate, current_author_id: int) -> BookDetail:
    book = repository.get_by_id(db, book_id)
    if book is None:
        raise NotFoundError("Book", book_id)
    if book.created_by_author_id != current_author_id:
        raise ForbiddenError("Only the book's creator can edit it.")
    book = repository.update(
        db, book,
        title=data.title,
        price=data.price,
        description=data.description,
        publish_date=data.publish_date,
        thumbnail=data.thumbnail,
        series_id=data.series_id,
        volume_number=data.volume_number,
        author_ids=data.author_ids,
        genre_ids=data.genre_ids,
    )
    book = repository.get_by_id(db, book.id)
    return _to_detail(book)


def delete_book(db: Session, book_id: int, current_author_id: int) -> None:
    book = repository.get_by_id(db, book_id)
    if book is None:
        raise NotFoundError("Book", book_id)
    if book.created_by_author_id != current_author_id:
        raise ForbiddenError("Only the book's creator can delete it.")
    repository.delete(db, book)


def get_book(db: Session, book_id: int) -> BookDetail:
    book = repository.get_by_id(db, book_id)
    if book is None:
        raise NotFoundError("Book", book_id)
    return _to_detail(book)
