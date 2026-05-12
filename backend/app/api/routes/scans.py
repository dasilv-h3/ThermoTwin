from datetime import UTC, datetime
from typing import Annotated

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user
from app.models.scan_session import ScanSession
from app.models.user import User
from app.schemas.scan import (
    ScanDetail,
    ScanHistoryResponse,
    ScanResultsRequest,
    ScanSessionFinalizeRequest,
    ScanSessionFinalizeResponse,
    ScanSessionStartRequest,
    ScanSessionStartResponse,
    ScanSummary,
)
from app.services.scan_credit import decide_credit_consumption

router = APIRouter(prefix="/scans", tags=["Scans"])


def _to_summary(s: ScanSession) -> ScanSummary:
    return ScanSummary(
        id=str(s.id),
        started_at=s.started_at,
        finalized_at=s.finalized_at,
        location_label=s.location_label,
        dpe_class=s.dpe_class,
        duration_ms=s.duration_ms,
    )


def _to_detail(s: ScanSession) -> ScanDetail:
    return ScanDetail(
        id=str(s.id),
        started_at=s.started_at,
        finalized_at=s.finalized_at,
        location_label=s.location_label,
        dpe_class=s.dpe_class,
        duration_ms=s.duration_ms,
        capture_mode=s.capture_mode,
        frame_count=s.frame_count,
        credit_consumed=s.credit_consumed,
        dpe_consumption=s.dpe_consumption,
        dpe_emissions=s.dpe_emissions,
        thermal_stats=s.thermal_stats,
        heat_zones=s.heat_zones,
        nearby_artisans=s.nearby_artisans,
    )


async def _load_owned(scan_id: str, user: User) -> ScanSession:
    try:
        oid = PydanticObjectId(scan_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid scan id")
    session = await ScanSession.get(oid)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan session not found")
    if session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return session


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
    session = await _load_owned(scan_id, user)
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


@router.patch("/{scan_id}/results", response_model=ScanDetail)
async def attach_scan_results(
    scan_id: str,
    body: ScanResultsRequest,
    user: Annotated[User, Depends(get_current_user)],
) -> ScanDetail:
    """Attache les résultats post-traitement (DPE, thermal, artisans) au scan.

    Appelé par le frontend après finalize(), une fois que l'analyse thermique
    et la requête `/artisans/nearby` ont produit leurs sorties.
    """
    session = await _load_owned(scan_id, user)
    if body.location_label is not None:
        session.location_label = body.location_label
    if body.duration_ms is not None:
        session.duration_ms = body.duration_ms
    if body.dpe_consumption is not None:
        session.dpe_consumption = body.dpe_consumption
    if body.dpe_emissions is not None:
        session.dpe_emissions = body.dpe_emissions
    if body.dpe_class is not None:
        session.dpe_class = body.dpe_class
    if body.thermal_stats is not None:
        session.thermal_stats = body.thermal_stats
    if body.heat_zones:
        session.heat_zones = body.heat_zones
    if body.nearby_artisans:
        session.nearby_artisans = body.nearby_artisans
    await session.save()
    return _to_detail(session)


@router.get("", response_model=ScanHistoryResponse)
async def list_scan_history(
    user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(50, ge=1, le=100),
) -> ScanHistoryResponse:
    """Historique des scans de l'utilisateur, plus récent en premier."""
    cursor = ScanSession.find(ScanSession.user_id == user.id).sort(-ScanSession.started_at).limit(limit)
    sessions = await cursor.to_list()
    return ScanHistoryResponse(
        items=[_to_summary(s) for s in sessions],
        total=len(sessions),
    )


@router.get("/{scan_id}", response_model=ScanDetail)
async def get_scan_detail(
    scan_id: str,
    user: Annotated[User, Depends(get_current_user)],
) -> ScanDetail:
    session = await _load_owned(scan_id, user)
    return _to_detail(session)
