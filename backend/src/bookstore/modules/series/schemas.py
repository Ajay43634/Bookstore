from decimal import Decimal

from pydantic import BaseModel


class SeriesCreate(BaseModel):
    name: str
    description: str | None = None


class VolumeRef(BaseModel):
    id: int
    title: str
    volume_number: int
    thumbnail: str | None = None
    price: Decimal

    model_config = {"from_attributes": True}


class SeriesDetail(BaseModel):
    id: int
    name: str
    description: str | None = None
    volumes: list[VolumeRef] = []
