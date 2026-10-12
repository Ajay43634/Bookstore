from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from bookstore.modules.authors import service
from bookstore.modules.authors.schemas import AuthorDetail, PaginatedAuthors
from bookstore.shared.deps import get_db

router = APIRouter(prefix="/authors", tags=["authors"])


@router.get("", response_model=PaginatedAuthors)
async def list_authors(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedAuthors:
    return service.list_authors(db, page, page_size)


@router.get("/{author_id}", response_model=AuthorDetail)
async def get_author(author_id: int, db: Session = Depends(get_db)) -> AuthorDetail:
    return service.get_author(db, author_id)
