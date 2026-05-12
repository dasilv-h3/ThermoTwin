"""Décision pure de consommation de crédit en fin de scan.

Isolée de la couche DB pour rester testable sans mock : la règle métier
("on consomme 1 crédit si frame_count > 0 et pas déjà finalisée") doit être
vérifiable sans démarrer Mongo.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class CreditDecision:
    should_consume: bool
    reason: str  # debug / log uniquement


def decide_credit_consumption(
    frame_count: int,
    already_finalized: bool,
    scans_used: int,
    scans_limit: int,
) -> CreditDecision:
    """Détermine si finalize() doit incrémenter scans_used.

    Règles :
    - Pas de double-consommation : si déjà finalisée → no-op (idempotence)
    - Pas de débit si scan vide : aucun frame capté → no-op
    - Quota plein : refuse de consommer si scans_used >= scans_limit
      (situation théorique : le frontend devrait avoir bloqué avant)
    """
    if already_finalized:
        return CreditDecision(should_consume=False, reason="already-finalized")
    if frame_count <= 0:
        return CreditDecision(should_consume=False, reason="no-frames")
    if scans_used >= scans_limit:
        return CreditDecision(should_consume=False, reason="quota-exceeded")
    return CreditDecision(should_consume=True, reason="ok")
