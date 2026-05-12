from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.credits import (
    CreditPackListResponse,
    CreditPackResponse,
    CreditPurchaseRequest,
    CreditPurchaseResponse,
)
from app.services.credits import CREDIT_PACKS, get_pack, list_packs

router = APIRouter(prefix="/credits", tags=["Credits"])


@router.get("/packs", response_model=CreditPackListResponse)
async def get_credit_packs() -> CreditPackListResponse:
    """Catalogue des packs de crédits disponibles à l'achat."""
    items = [CreditPackResponse(id=p.id, credits=p.credits, price_eur=p.price_eur, label=p.label) for p in list_packs()]
    return CreditPackListResponse(items=items)


@router.post("/purchase", response_model=CreditPurchaseResponse)
async def purchase_credits(
    body: CreditPurchaseRequest,
    user: Annotated[User, Depends(get_current_user)],
) -> CreditPurchaseResponse:
    """Achète un pack de crédits. Mock Stripe : crédit immédiat côté backend.

    En production, cet endpoint démarrera une Stripe Checkout Session et le
    crédit ne sera ajouté que par le webhook `checkout.session.completed`.
    """
    if body.pack_id not in CREDIT_PACKS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown pack")

    pack = get_pack(body.pack_id)
    user.subscription.scans_limit += pack.credits
    await user.save()

    return CreditPurchaseResponse(
        pack_id=pack.id,
        credits_added=pack.credits,
        scans_used=user.subscription.scans_used,
        scans_limit=user.subscription.scans_limit,
    )
