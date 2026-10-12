from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bookstore.shared.db import Base


class Genre(Base):
    __tablename__ = "genres"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    book_associations: Mapped[list[BookGenre]] = relationship(
        "BookGenre", back_populates="genre"
    )


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    publish_date: Mapped[date | None] = mapped_column(Date)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    thumbnail: Mapped[str | None] = mapped_column(String(500))
    series_id: Mapped[int | None] = mapped_column(ForeignKey("series.id"), nullable=True)
    volume_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_by_author_id: Mapped[int] = mapped_column(
        ForeignKey("authors.id"), nullable=False
    )

    series: Mapped[Series | None] = relationship("Series", back_populates="books")
    creator: Mapped[Author] = relationship(
        "Author",
        foreign_keys=[created_by_author_id],
        back_populates="created_books",
    )
    author_associations: Mapped[list[BookAuthor]] = relationship(
        "BookAuthor", back_populates="book", cascade="all, delete-orphan"
    )
    genre_associations: Mapped[list[BookGenre]] = relationship(
        "BookGenre", back_populates="book", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("series_id", "volume_number", name="uq_book_series_volume"),
    )


class BookAuthor(Base):
    __tablename__ = "book_authors"

    book_id: Mapped[int] = mapped_column(
        ForeignKey("books.id", ondelete="CASCADE"), primary_key=True
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("authors.id", ondelete="CASCADE"), primary_key=True
    )

    book: Mapped[Book] = relationship("Book", back_populates="author_associations")
    author: Mapped[Author] = relationship("Author", back_populates="book_associations")


class BookGenre(Base):
    __tablename__ = "book_genres"

    book_id: Mapped[int] = mapped_column(
        ForeignKey("books.id", ondelete="CASCADE"), primary_key=True
    )
    genre_id: Mapped[int] = mapped_column(
        ForeignKey("genres.id", ondelete="CASCADE"), primary_key=True
    )

    book: Mapped[Book] = relationship("Book", back_populates="genre_associations")
    genre: Mapped[Genre] = relationship("Genre", back_populates="book_associations")


from bookstore.modules.authors.models import Author  # noqa: E402, F401
from bookstore.modules.series.models import Series  # noqa: E402, F401
