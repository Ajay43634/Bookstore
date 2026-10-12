from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class AuthorRef(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class GenreRef(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SeriesRef(BaseModel):
    id: int
    name: str
    volume_number: int | None = None

    model_config = {"from_attributes": True}


class BookSummary(BaseModel):
    id: int
    title: str
    description: str | None = None
    publish_date: date | None = None
    price: Decimal
    thumbnail: str | None = None
    authors: list[AuthorRef] = []
    genres: list[GenreRef] = []

    model_config = {"from_attributes": True}


class BookDetail(BaseModel):
    id: int
    title: str
    description: str | None = None
    publish_date: date | None = None
    price: Decimal
    thumbnail: str | None = None
    authors: list[AuthorRef] = []
    genres: list[GenreRef] = []
    series: SeriesRef | None = None
    volume_number: int | None = None

    model_config = {"from_attributes": True}


class PaginatedBooks(BaseModel):
    data: list[BookSummary]
    page: int
    page_size: int
    total: int


class BookCreate(BaseModel):
    title: str
    price: Decimal
    description: str | None = None
    publish_date: date | None = None
    thumbnail: str | None = None
    series_id: int | None = None
    volume_number: int | None = None
    author_ids: list[int] = []
    genre_ids: list[int] = []


class BookUpdate(BaseModel):
    title: str | None = None
    price: Decimal | None = None
    description: str | None = None
    publish_date: date | None = None
    thumbnail: str | None = None
    series_id: int | None = None
    volume_number: int | None = None
    author_ids: list[int] | None = None
    genre_ids: list[int] | None = None
