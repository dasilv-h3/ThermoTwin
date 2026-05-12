from datetime import UTC, datetime
from typing import Annotated

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.scan_session import ScanSession
from app.models.user import User
from app.schemas.scan import (
    ScanSessionFinalizeRequest,
    ScanSessionFinalizeResponse,
    ScanSessionStartRequest,
    ScanSessionStartResponse,
)
from app.services.scan_credit import decide_credit_consumption

router = APIRouter(prefix="/scans", tags=["Scans"])


@router.post("/start", response_model=ScanSessionStartResponse, status_code=status.HTTP_201_CREATED)
async def start_scan_session(
    body: ScanSessionStartRequest,
    user: Annotated[User, Depends(get_current_user)],
) -> ScanSessionStartResponse:
    """Crée une session de scan AR. Le crédit n'est consommé qu'au finalize()."""
    session = ScanSession(user_id=user.id, capture_mode=body.capture_mode)
    await session.insert()
    return ScanSessionStartResponse(scan_id=str(session.id), started_at=session.started_at)


@router.post("/{scan_id}/finalize", response_model=ScanSessionFinalizeResponse)
async def finalize_scan_session(
    scan_id: str,
    body: ScanSessionFinalizeRequest,
    user: Annotated[User, Depends(get_current_user)],
) -> ScanSessionFinalizeResponse:
    """Termine une session de scan AR et consomme 1 crédit si conditions OK.

    Idempotent : un même scan_id appelé deux fois ne consomme qu'une fois.
    """
    try:
        oid = PydanticObjectId(scan_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid scan id")

    session = await ScanSession.get(oid)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan session not found")
    if session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    decision = decide_credit_consumption(
        frame_count=body.frame_count,
        already_finalized=session.finalized_at is not None,
        scans_used=user.subscription.scans_used,
        scans_limit=user.subscription.scans_limit,
    )

    if decision.should_consume:
        user.subscription.scans_used += 1
        await user.save()
        session.credit_consumed = True

    # Toujours mettre à jour frame_count et finalized_at (sauf si déjà finalize).
    if session.finalized_at is None:
        session.frame_count = body.frame_count
        session.finalized_at = datetime.now(UTC)
        await session.save()

    return ScanSessionFinalizeResponse(
        scan_id=str(session.id),
        finalized_at=session.finalized_at,
        credit_consumed=session.credit_consumed,
        reason=decision.reason,
        scans_used=user.subscription.scans_used,
        scans_limit=user.subscription.scans_limit,
    )
