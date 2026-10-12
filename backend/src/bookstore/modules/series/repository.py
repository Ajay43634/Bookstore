from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from bookstore.modules.books.models import Book
from bookstore.modules.series.models import Series


def create(db: Session, name: str, description: str | None) -> Series:
    series = Series(name=name, description=description)
    db.add(series)
    db.commit()
    db.refresh(series)
    return series


def get_by_id(db: Session, series_id: int) -> Series | None:
    return db.scalar(
        select(Series)
        .where(Series.id == series_id)
        .options(selectinload(Series.books))
    )
