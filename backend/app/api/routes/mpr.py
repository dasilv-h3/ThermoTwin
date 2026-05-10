from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.mpr import EligibilityRequest, EligibilityResponse
from app.services.mpr_eligibility import check_eligibility

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
