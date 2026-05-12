"""Catalogue de packs de crédits et logique d'application.

Stripe est mocké pour le POC : la confirmation est immédiate côté backend.
Brancher Stripe Checkout (session + webhook) en passant à la facturation réelle.
"""

from dataclasses import dataclass
from enum import Enum


class CreditPackId(str, Enum):
    STARTER = "starter"
    PRO = "pro"
    UNLIMITED = "unlimited"


@dataclass(frozen=True)
class CreditPack:
    id: CreditPackId
    credits: int
    price_eur: float
    label: str


CREDIT_PACKS: dict[CreditPackId, CreditPack] = {
    CreditPackId.STARTER: CreditPack(
        id=CreditPackId.STARTER,
        credits=1,
        price_eur=2.99,
        label="1 scan",
    ),
    CreditPackId.PRO: CreditPack(
        id=CreditPackId.PRO,
        credits=5,
        price_eur=11.99,
        label="5 scans",
    ),
    CreditPackId.UNLIMITED: CreditPack(
        id=CreditPackId.UNLIMITED,
        credits=20,
        price_eur=39.99,
        label="20 scans",
    ),
}


def get_pack(pack_id: CreditPackId) -> CreditPack:
    return CREDIT_PACKS[pack_id]


def list_packs() -> list[CreditPack]:
    return list(CREDIT_PACKS.values())
