from pydantic import BaseModel

from app.services.credits import CreditPackId


class CreditPackResponse(BaseModel):
    id: CreditPackId
    credits: int
    price_eur: float
    label: str


class CreditPackListResponse(BaseModel):
    items: list[CreditPackResponse]


class CreditPurchaseRequest(BaseModel):
    pack_id: CreditPackId


class CreditPurchaseResponse(BaseModel):
    pack_id: CreditPackId
    credits_added: int
    scans_used: int
    scans_limit: int
