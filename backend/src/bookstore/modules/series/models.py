from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bookstore.shared.db import Base


class Series(Base):
    __tablename__ = "series"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    books: Mapped[list[Book]] = relationship("Book", back_populates="series")


# avoid circular import at type-check time
from bookstore.modules.books.models import Book  # noqa: E402, F401
