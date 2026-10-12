from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from bookstore.modules.auth.routes import router as auth_router
from bookstore.modules.authors.routes import router as authors_router
from bookstore.modules.books.routes import router as books_router
from bookstore.modules.cart.routes import router as cart_router
from bookstore.modules.series.routes import router as series_router
from bookstore.shared.errors import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    conflict_handler,
    forbidden_handler,
    not_found_handler,
    unauthorized_handler,
)

app = FastAPI(title="BookStore API", version="0.1.0")

# ── Exception handlers ────────────────────────────────────────────────────────
app.add_exception_handler(NotFoundError, not_found_handler)        # type: ignore[arg-type]
app.add_exception_handler(ForbiddenError, forbidden_handler)       # type: ignore[arg-type]
app.add_exception_handler(UnauthorizedError, unauthorized_handler) # type: ignore[arg-type]
app.add_exception_handler(ConflictError, conflict_handler)         # type: ignore[arg-type]


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": "Duplicate or constraint violation."})


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api/v1")
app.include_router(authors_router, prefix="/api/v1")
app.include_router(books_router, prefix="/api/v1")
app.include_router(series_router, prefix="/api/v1")
app.include_router(cart_router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health() -> dict[str, bool]:
    return {"ok": True}
