from collections.abc import Generator

import jwt
from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from bookstore.modules.authors.models import Author
from bookstore.shared import security
from bookstore.shared.db import SessionLocal
from bookstore.shared.errors import UnauthorizedError


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_author(
    request: Request,
    db: Session = Depends(get_db),
) -> Author:
    token: str | None = None

    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.removeprefix("Bearer ").strip()

    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise UnauthorizedError()

    try:
        author_id = security.decode_token(token)
    except jwt.PyJWTError:
        raise UnauthorizedError("Invalid or expired token.")

    author = db.scalar(select(Author).where(Author.id == author_id))
    if author is None:
        raise UnauthorizedError()

    return author
