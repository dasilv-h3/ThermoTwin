from pydantic import BaseModel, Field

from app.models.mpr_amount import GeoZone, IncomeBracket, WorkType


class EligibilityRequest(BaseModel):
    revenu_fiscal: int = Field(ge=0, description="Revenu fiscal de référence du foyer (€)")
    household_size: int = Field(ge=1, le=20, description="Nombre de personnes composant le foyer")
    zone: GeoZone = Field(description="Zone géographique : idf ou hors_idf")
    work_type: WorkType = Field(description="Type de travaux envisagés")
    year: int = Field(default=2026, ge=2024, le=2030, description="Année du barème à appliquer")


class EligibilityResponse(BaseModel):
    is_eligible: bool
    bracket: IncomeBracket
    reason: str = Field(
        description=(
            "Stable string code: 'ok' | 'work_type_not_in_bareme' | "
            "'bracket_not_eligible_for_this_work' | 'no_thresholds_for_year'"
        )
    )
    work_type: WorkType
    year: int
