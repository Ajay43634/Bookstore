from sqlalchemy.orm import Session

from bookstore.modules.series import repository
from bookstore.modules.series.schemas import SeriesCreate, SeriesDetail, VolumeRef
from bookstore.shared.errors import NotFoundError


def create_series(db: Session, data: SeriesCreate) -> SeriesDetail:
    series = repository.create(db, name=data.name, description=data.description)
    return SeriesDetail(id=series.id, name=series.name, description=series.description, volumes=[])


def get_series(db: Session, series_id: int) -> SeriesDetail:
    series = repository.get_by_id(db, series_id)
    if series is None:
        raise NotFoundError("Series", series_id)

    volumes = sorted(
        (b for b in series.books if b.volume_number is not None),
        key=lambda b: b.volume_number,  # type: ignore[arg-type]
    )
    return SeriesDetail(
        id=series.id,
        name=series.name,
        description=series.description,
        volumes=[
            VolumeRef(
                id=b.id,
                title=b.title,
                volume_number=b.volume_number,  # type: ignore[arg-type]
                thumbnail=b.thumbnail,
                price=b.price,
            )
            for b in volumes
        ],
    )
