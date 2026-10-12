from sqlalchemy.orm import Session

from bookstore.modules.authors import repository
from bookstore.modules.authors.schemas import (
    AuthorDetail,
    AuthorSummary,
    BookSummary,
    PaginatedAuthors,
)
from bookstore.shared.errors import NotFoundError


def list_authors(db: Session, page: int, page_size: int) -> PaginatedAuthors:
    authors, total = repository.list_authors(db, page, page_size)
    return PaginatedAuthors(
        data=[AuthorSummary.model_validate(a) for a in authors],
        page=page,
        page_size=page_size,
        total=total,
    )


def get_author(db: Session, author_id: int) -> AuthorDetail:
    author = repository.get_by_id(db, author_id)
    if author is None:
        raise NotFoundError("Author", author_id)
    books = [BookSummary.model_validate(assoc.book) for assoc in author.book_associations]
    return AuthorDetail(
        id=author.id,
        name=author.name,
        email=author.email,
        bio=author.bio,
        profile_picture=author.profile_picture,
        nationality=author.nationality,
        date_of_birth=author.date_of_birth,
        books=books,
    )
