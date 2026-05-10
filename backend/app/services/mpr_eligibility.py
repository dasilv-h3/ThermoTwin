"""MaPrimeRénov' eligibility logic.

Pure async service that, given a household profile and a planned work type,
returns the income bracket (BLEU/JAUNE/VIOLET/ROSE) and whether the household
is eligible for MaPrimeRénov' parcours par geste on that work.

Reads from the `mpr_amounts` and `mpr_income_thresholds` collections seeded
by GPTT-101 (`scripts/seed_mpr_amounts.py`).

Consumed by GPTT-103 (montant) and GPTT-104 (UI).
"""

from dataclasses import dataclass

from app.models.mpr_amount import (
    GeoZone,
    IncomeBracket,
    MprAmount,
    MprIncomeThreshold,
    WorkType,
)

# Reasons returned by `check_eligibility`. Stable string codes — the frontend
# may key on them for localized error messages.
REASON_OK = "ok"
REASON_WORK_TYPE_NOT_IN_BAREME = "work_type_not_in_bareme"
REASON_BRACKET_NOT_ELIGIBLE = "bracket_not_eligible_for_this_work"
REASON_NO_THRESHOLDS_FOR_YEAR = "no_thresholds_for_year"


@dataclass(frozen=True)
class Thresholds:
    """Income thresholds (max RFR per bracket) for one (year, zone, size) tuple."""

    bleu_max: int
    jaune_max: int
    violet_max: int


@dataclass(frozen=True)
class EligibilityResult:
    is_eligible: bool
    bracket: IncomeBracket
    reason: str
    work_type: WorkType
    year: int


async def compute_thresholds(year: int, zone: GeoZone, household_size: int) -> Thresholds | None:
    """Resolve income-bracket thresholds for a household of `household_size` persons.

    For sizes 1-5 we look up the dedicated row. For sizes >5 we take the size-5
    row and add (size-5) * the per-additional-person increment row.
    """
    if household_size < 1:
        raise ValueError("household_size must be >= 1")

    base_size = min(household_size, 5)
    base = await MprIncomeThreshold.find_one(
        MprIncomeThreshold.year == year,
        MprIncomeThreshold.zone == zone,
        MprIncomeThreshold.household_size == base_size,
        MprIncomeThreshold.is_additional_person == False,  # noqa: E712 (Beanie filter syntax)
    )
    if base is None:
        return None

    if household_size <= 5:
        return Thresholds(
            bleu_max=base.bleu_max, jaune_max=base.jaune_max, violet_max=base.violet_max
        )

    extra = await MprIncomeThreshold.find_one(
        MprIncomeThreshold.year == year,
        MprIncomeThreshold.zone == zone,
        MprIncomeThreshold.is_additional_person == True,  # noqa: E712
    )
    if extra is None:
        return Thresholds(
            bleu_max=base.bleu_max, jaune_max=base.jaune_max, violet_max=base.violet_max
        )

    n = household_size - 5
    return Thresholds(
        bleu_max=base.bleu_max + n * extra.bleu_max,
        jaune_max=base.jaune_max + n * extra.jaune_max,
        violet_max=base.violet_max + n * extra.violet_max,
    )


def classify_bracket(revenu_fiscal: int, thresholds: Thresholds) -> IncomeBracket:
    """Map a tax revenue to its bracket given the resolved thresholds."""
    if revenu_fiscal <= thresholds.bleu_max:
        return IncomeBracket.BLEU
    if revenu_fiscal <= thresholds.jaune_max:
        return IncomeBracket.JAUNE
    if revenu_fiscal <= thresholds.violet_max:
        return IncomeBracket.VIOLET
    return IncomeBracket.ROSE


async def compute_income_bracket(
    revenu_fiscal: int, household_size: int, zone: GeoZone, year: int
) -> IncomeBracket | None:
    """Return the income bracket for a household, or None if year unseeded."""
    if revenu_fiscal < 0:
        raise ValueError("revenu_fiscal must be >= 0")
    thresholds = await compute_thresholds(year, zone, household_size)
    if thresholds is None:
        return None
    return classify_bracket(revenu_fiscal, thresholds)


def _amount_for_bracket(amount: MprAmount, bracket: IncomeBracket) -> float | None:
    """Read the per-bracket amount column on an MprAmount row."""
    return {
        IncomeBracket.BLEU: amount.amount_bleu,
        IncomeBracket.JAUNE: amount.amount_jaune,
        IncomeBracket.VIOLET: amount.amount_violet,
        IncomeBracket.ROSE: amount.amount_rose,
    }[bracket]


async def check_eligibility(
    revenu_fiscal: int,
    household_size: int,
    zone: GeoZone,
    work_type: WorkType,
    year: int,
) -> EligibilityResult:
    """Check whether a household is eligible to MPR par geste on a given work.

    Eligibility = (a) the work type exists in the year's barème AND (b) the
    household's bracket has a non-null amount for that work. In 2026 the ROSE
    bracket is excluded from the parcours par geste, so any ROSE → not eligible.
    """
    bracket = await compute_income_bracket(revenu_fiscal, household_size, zone, year)
    if bracket is None:
        # Use BLEU as a placeholder so the response stays well-typed; consumers
        # should branch on `reason` first, not on `bracket`, when not eligible.
        return EligibilityResult(
            is_eligible=False,
            bracket=IncomeBracket.BLEU,
            reason=REASON_NO_THRESHOLDS_FOR_YEAR,
            work_type=work_type,
            year=year,
        )

    amount = await MprAmount.find_one(
        MprAmount.year == year,
        MprAmount.work_type == work_type,
    )
    if amount is None:
        return EligibilityResult(
            is_eligible=False,
            bracket=bracket,
            reason=REASON_WORK_TYPE_NOT_IN_BAREME,
            work_type=work_type,
            year=year,
        )

    bracket_amount = _amount_for_bracket(amount, bracket)
    if bracket_amount is None:
        return EligibilityResult(
            is_eligible=False,
            bracket=bracket,
            reason=REASON_BRACKET_NOT_ELIGIBLE,
            work_type=work_type,
            year=year,
        )

    return EligibilityResult(
        is_eligible=True,
        bracket=bracket,
        reason=REASON_OK,
        work_type=work_type,
        year=year,
    )
