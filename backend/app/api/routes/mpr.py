from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.mpr import (
    AidAmountRequest,
    AidAmountResponse,
    EligibilityRequest,
    EligibilityResponse,
)
from app.services.mpr_eligibility import check_eligibility, compute_aid_amount

router = APIRouter(prefix="/mpr", tags=["MaPrimeRénov"])


@router.post("/eligibility", response_model=EligibilityResponse)
async def post_eligibility(
    payload: EligibilityRequest,
    _user: Annotated[User, Depends(get_current_user)],
):
    """Determine the household's income bracket and whether it is eligible
    to MaPrimeRénov' parcours par geste for the requested work type."""
    result = await check_eligibility(
        revenu_fiscal=payload.revenu_fiscal,
        household_size=payload.household_size,
        zone=payload.zone,
        work_type=payload.work_type,
        year=payload.year,
    )
    return EligibilityResponse(
        is_eligible=result.is_eligible,
        bracket=result.bracket,
        reason=result.reason,
        work_type=result.work_type,
        year=result.year,
    )


@router.post("/aid-amount", response_model=AidAmountResponse)
async def post_aid_amount(
    payload: AidAmountRequest,
    _user: Annotated[User, Depends(get_current_user)],
):
    """Compute the actual MaPrimeRénov' aid amount in € for a given household,
    work type and quantity. Returns 0 € with a reason code when the foyer is
    not eligible (ROSE bracket, year unseeded, work not in barème)."""
    result = await compute_aid_amount(
        revenu_fiscal=payload.revenu_fiscal,
        household_size=payload.household_size,
        zone=payload.zone,
        work_type=payload.work_type,
        year=payload.year,
        quantity=payload.quantity,
    )
    return AidAmountResponse(
        is_eligible=result.is_eligible,
        amount=result.amount,
        unit_amount=result.unit_amount,
        quantity_applied=result.quantity_applied,
        bracket=result.bracket,
        work_type=result.work_type,
        unit=result.unit,
        year=result.year,
        reason=result.reason,
    )
