import uuid

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/checkout", tags=["cart"])


class CheckoutItem(BaseModel):
    book_id: int
    qty: int


class CheckoutIn(BaseModel):
    name: str
    email: str
    address: str
    items: list[CheckoutItem]


class CheckoutOut(BaseModel):
    order_id: str
    message: str


@router.post("", response_model=CheckoutOut, status_code=201)
async def checkout(body: CheckoutIn) -> CheckoutOut:
    order_id = str(uuid.uuid4())[:8].upper()
    return CheckoutOut(
        order_id=order_id,
        message=f"Order {order_id} received! Thank you, {body.name}. (This is a mock — no payment taken.)",
    )
