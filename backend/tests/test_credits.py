"""Tests du catalogue de packs (logique pure)."""

from app.services.credits import CreditPackId, get_pack, list_packs


def test_list_packs_returns_all_packs():
    packs = list_packs()
    assert len(packs) == 3
    ids = {p.id for p in packs}
    assert ids == {CreditPackId.STARTER, CreditPackId.PRO, CreditPackId.UNLIMITED}


def test_packs_have_positive_credits_and_prices():
    for pack in list_packs():
        assert pack.credits > 0
        assert pack.price_eur > 0
        assert pack.label


def test_get_pack_returns_correct_credits():
    assert get_pack(CreditPackId.STARTER).credits == 1
    assert get_pack(CreditPackId.PRO).credits == 5
    assert get_pack(CreditPackId.UNLIMITED).credits == 20


def test_credits_per_euro_better_with_bigger_pack():
    # Prix unitaire (€/scan) doit décroître avec la taille du pack.
    starter = get_pack(CreditPackId.STARTER)
    pro = get_pack(CreditPackId.PRO)
    unlimited = get_pack(CreditPackId.UNLIMITED)
    assert starter.price_eur / starter.credits > pro.price_eur / pro.credits
    assert pro.price_eur / pro.credits > unlimited.price_eur / unlimited.credits
