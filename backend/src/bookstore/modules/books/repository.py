from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from bookstore.modules.books.models import Book, BookAuthor, BookGenre, Genre


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
) -> tuple[list[Book], int]:
    stmt = select(Book)

    if q:
        stmt = stmt.where(Book.title.ilike(f"%{q}%"))
    if author_id is not None:
        sub = select(BookAuthor.book_id).where(BookAuthor.author_id == author_id)
        stmt = stmt.where(Book.id.in_(sub))
    if genre:
        sub = select(BookGenre.book_id).join(Genre).where(Genre.name.ilike(genre))
        stmt = stmt.where(Book.id.in_(sub))
    if published_after is not None:
        stmt = stmt.where(Book.publish_date >= published_after)
    if published_before is not None:
        stmt = stmt.where(Book.publish_date <= published_before)
    if series_id is not None:
        stmt = stmt.where(Book.series_id == series_id)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    books = list(
        db.scalars(
            stmt.options(
                selectinload(Book.author_associations).selectinload(BookAuthor.author),
                selectinload(Book.genre_associations).selectinload(BookGenre.genre),
            )
            .order_by(Book.title)
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
    )
    return books, total


def create(
    db: Session,
    title: str,
    price,
    created_by_author_id: int,
    description: str | None = None,
    publish_date: date | None = None,
    thumbnail: str | None = None,
    series_id: int | None = None,
    volume_number: int | None = None,
    author_ids: list[int] | None = None,
    genre_ids: list[int] | None = None,
) -> Book:
    book = Book(
        title=title,
        price=price,
        created_by_author_id=created_by_author_id,
        description=description,
        publish_date=publish_date,
        thumbnail=thumbnail,
        series_id=series_id,
        volume_number=volume_number,
    )
    db.add(book)
    db.flush()

    # always include creator as an author
    all_author_ids = list({created_by_author_id, *(author_ids or [])})
    for aid in all_author_ids:
        db.add(BookAuthor(book_id=book.id, author_id=aid))
    for gid in genre_ids or []:
        db.add(BookGenre(book_id=book.id, genre_id=gid))

    db.commit()
    db.refresh(book)
    return book


def update(
    db: Session,
    book: Book,
    title: str | None = None,
    price=None,
    description: str | None = None,
    publish_date: date | None = None,
    thumbnail: str | None = None,
    series_id: int | None = None,
    volume_number: int | None = None,
    author_ids: list[int] | None = None,
    genre_ids: list[int] | None = None,
) -> Book:
    if title is not None:
        book.title = title
    if price is not None:
        book.price = price
    if description is not None:
        book.description = description
    if publish_date is not None:
        book.publish_date = publish_date
    if thumbnail is not None:
        book.thumbnail = thumbnail
    if series_id is not None:
        book.series_id = series_id
    if volume_number is not None:
        book.volume_number = volume_number

    if author_ids is not None:
        db.query(BookAuthor).filter(BookAuthor.book_id == book.id).delete()
        all_author_ids = list({book.created_by_author_id, *author_ids})
        for aid in all_author_ids:
            db.add(BookAuthor(book_id=book.id, author_id=aid))

    if genre_ids is not None:
        db.query(BookGenre).filter(BookGenre.book_id == book.id).delete()
        for gid in genre_ids:
            db.add(BookGenre(book_id=book.id, genre_id=gid))

    db.commit()
    db.refresh(book)
    return book


def delete(db: Session, book: Book) -> None:
    db.delete(book)
    db.commit()


def get_by_id(db: Session, book_id: int) -> Book | None:
    return db.scalar(
        select(Book)
        .where(Book.id == book_id)
        .options(
            selectinload(Book.author_associations).selectinload(BookAuthor.author),
            selectinload(Book.genre_associations).selectinload(BookGenre.genre),
            selectinload(Book.series),
        )
    )
