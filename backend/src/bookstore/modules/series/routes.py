from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from bookstore.modules.authors.models import Author
from bookstore.modules.series import service
from bookstore.modules.series.schemas import SeriesCreate, SeriesDetail
from bookstore.shared.deps import get_current_author, get_db

router = APIRouter(prefix="/series", tags=["series"])


@router.post("", response_model=SeriesDetail, status_code=201)
async def create_series(
    body: SeriesCreate,
    db: Session = Depends(get_db),
    _: Author = Depends(get_current_author),
) -> SeriesDetail:
    return service.create_series(db, body)


@router.get("/{series_id}", response_model=SeriesDetail)
async def get_series(series_id: int, db: Session = Depends(get_db)) -> SeriesDetail:
    return service.get_series(db, series_id)
