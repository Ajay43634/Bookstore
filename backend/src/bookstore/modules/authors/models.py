from __future__ import annotations

from datetime import date

from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bookstore.shared.db import Base


class Author(Base):
    __tablename__ = "authors"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text)
    profile_picture: Mapped[str | None] = mapped_column(String(500))
    nationality: Mapped[str | None] = mapped_column(String(100))
    date_of_birth: Mapped[date | None] = mapped_column(Date)

    book_associations: Mapped[list[BookAuthor]] = relationship(
        "BookAuthor", back_populates="author"
    )
    created_books: Mapped[list[Book]] = relationship(
        "Book", foreign_keys="Book.created_by_author_id", back_populates="creator"
    )


from bookstore.modules.books.models import Book, BookAuthor  # noqa: E402, F401
