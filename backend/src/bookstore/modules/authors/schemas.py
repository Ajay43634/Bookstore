from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class BookSummary(BaseModel):
    id: int
    title: str
    thumbnail: str | None = None
    price: Decimal

    model_config = {"from_attributes": True}


class AuthorSummary(BaseModel):
    id: int
    name: str
    bio: str | None = None
    profile_picture: str | None = None
    nationality: str | None = None

    model_config = {"from_attributes": True}


class AuthorDetail(BaseModel):
    id: int
    name: str
    email: str
    bio: str | None = None
    profile_picture: str | None = None
    nationality: str | None = None
    date_of_birth: date | None = None
    books: list[BookSummary] = []

    model_config = {"from_attributes": True}


class PaginatedAuthors(BaseModel):
    data: list[AuthorSummary]
    page: int
    page_size: int
    total: int
