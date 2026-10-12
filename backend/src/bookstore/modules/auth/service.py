from sqlalchemy.orm import Session

from bookstore.modules.auth import repository
from bookstore.modules.auth.schemas import AuthorMe, TokenResponse
from bookstore.shared import security
from bookstore.shared.errors import ConflictError, UnauthorizedError


def register(
    db: Session,
    name: str,
    email: str,
    password: str,
    bio: str | None,
    nationality: str | None,
) -> TokenResponse:
    if repository.get_by_email(db, email) is not None:
        raise ConflictError("An account with that email already exists.")
    author = repository.create_author(
        db,
        name=name,
        email=email,
        password_hash=security.hash_password(password),
        bio=bio,
        nationality=nationality,
    )
    token = security.create_token(author.id)
    return TokenResponse(access_token=token, author=AuthorMe.model_validate(author))


def login(db: Session, email: str, password: str) -> TokenResponse:
    author = repository.get_by_email(db, email)
    if author is None or not security.verify_password(password, author.password_hash):
        raise UnauthorizedError("Invalid email or password.")
    token = security.create_token(author.id)
    return TokenResponse(access_token=token, author=AuthorMe.model_validate(author))
