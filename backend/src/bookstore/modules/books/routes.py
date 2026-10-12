from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from bookstore.modules.authors.models import Author
from bookstore.modules.books import service
from bookstore.modules.books.schemas import BookCreate, BookDetail, BookUpdate, PaginatedBooks
from bookstore.shared.deps import get_current_author, get_db

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=PaginatedBooks)
async def list_books(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: str | None = Query(None),
    author_id: int | None = Query(None),
    genre: str | None = Query(None),
    published_after: date | None = Query(None),
    published_before: date | None = Query(None),
    series_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> PaginatedBooks:
    return service.list_books(
        db, page, page_size,
        q=q, author_id=author_id, genre=genre,
        published_after=published_after, published_before=published_before,
        series_id=series_id,
    )


@router.get("/{book_id}", response_model=BookDetail)
async def get_book(book_id: int, db: Session = Depends(get_db)) -> BookDetail:
    return service.get_book(db, book_id)


@router.post("", response_model=BookDetail, status_code=201)
async def create_book(
    body: BookCreate,
    db: Session = Depends(get_db),
    current_author: Author = Depends(get_current_author),
) -> BookDetail:
    return service.create_book(db, body, current_author.id)


@router.patch("/{book_id}", response_model=BookDetail)
async def update_book(
    book_id: int,
    body: BookUpdate,
    db: Session = Depends(get_db),
    current_author: Author = Depends(get_current_author),
) -> BookDetail:
    return service.update_book(db, book_id, body, current_author.id)


@router.delete("/{book_id}", status_code=204)
async def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_author: Author = Depends(get_current_author),
) -> None:
    service.delete_book(db, book_id, current_author.id)
