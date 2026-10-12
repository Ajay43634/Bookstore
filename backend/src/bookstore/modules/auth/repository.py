from sqlalchemy import select
from sqlalchemy.orm import Session

from bookstore.modules.authors.models import Author


def get_by_email(db: Session, email: str) -> Author | None:
    return db.scalar(select(Author).where(Author.email == email))


def create_author(
    db: Session,
    name: str,
    email: str,
    password_hash: str,
    bio: str | None,
    nationality: str | None,
) -> Author:
    author = Author(
        name=name,
        email=email,
        password_hash=password_hash,
        bio=bio,
        nationality=nationality,
    )
    db.add(author)
    db.commit()
    db.refresh(author)
    return author
