from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from bookstore.modules.auth import service
from bookstore.modules.auth.schemas import AuthorMe, LoginIn, RegisterIn, TokenResponse
from bookstore.modules.authors.models import Author
from bookstore.shared.deps import get_current_author, get_db

router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE = "access_token"
_COOKIE_MAX_AGE = 60 * 60 * 24 * 30  # 30 days


def _set_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=_COOKIE,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=_COOKIE_MAX_AGE,
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterIn, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    result = service.register(db, body.name, body.email, body.password, body.bio, body.nationality)
    _set_cookie(response, result.access_token)
    return result


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginIn, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    result = service.login(db, body.email, body.password)
    _set_cookie(response, result.access_token)
    return result


@router.post("/logout", status_code=204)
async def logout(response: Response) -> None:
    response.delete_cookie(_COOKIE)


@router.get("/me", response_model=AuthorMe)
async def me(current_author: Author = Depends(get_current_author)) -> AuthorMe:
    return AuthorMe.model_validate(current_author)
