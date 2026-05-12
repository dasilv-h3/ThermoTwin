from typing import Annotated

from fastapi import APIRouter, Depends, Response

from app.ai.report_service import generate_pdf_report
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.report import ScanReportRequest

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post(
    "/scan-pdf",
    responses={200: {"content": {"application/pdf": {}}}},
    response_class=Response,
)
async def export_scan_pdf(
    body: ScanReportRequest,
    _user: Annotated[User, Depends(get_current_user)],
) -> Response:
    """Génère un PDF du rapport scan à partir d'un payload riche.

    Stateless : pas de relecture DB, le frontend pousse tout ce qu'il a déjà
    (résultats DPE, stats thermiques, artisans). Permet de générer un PDF de
    démo même sans scan persisté.
    """
    pdf = generate_pdf_report(body.model_dump(exclude_none=True))
    filename = (body.location_label or "thermotwin-scan").replace(" ", "_") + ".pdf"
    return Response(
        content=pdf.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
