from datetime import UTC, datetime
from enum import Enum

from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from pymongo import IndexModel


class Specialty(str, Enum):
    """Types of work an artisan can perform."""

    WALL_INSULATION = "wall_insulation"
    ROOF_INSULATION = "roof_insulation"
    FLOOR_INSULATION = "floor_insulation"
    WINDOW_REPLACEMENT = "window_replacement"
    HEATING = "heating"
    HEAT_PUMP = "heat_pump"
    VENTILATION = "ventilation"
    SOLAR_PANELS = "solar_panels"
    OTHER = "other"


class Certification(BaseModel):
    """RGE certification carried by the artisan."""

    name: str  # ex: "Qualibat RGE 8311", "Qualit'EnR QualiPV", "CNOA"
    code: str | None = None  # ex: "8311", "QualiPV"
    valid_until: datetime | None = None


class Location(BaseModel):
    """GeoJSON Point for MongoDB 2dsphere index.

    coordinates: [longitude, latitude] (WGS84) — note the order, not lat/lng.
    """

    type: str = "Point"
    coordinates: list[float] = Field(min_length=2, max_length=2)


class Artisan(Document):
    # Identity
    company_name: str
    siret: str  # 14-digit French company ID
    email: EmailStr | None = None
    phone: str | None = None

    # Description
    about: str | None = None
    specialties: list[Specialty] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)

    # Location
    address: str
    postal_code: str
    city: str
    location: Location  # GeoJSON Point for geo queries

    # Metrics displayed in the UI
    rating: float = Field(default=0.0, ge=0.0, le=5.0)
    reviews_count: int = Field(default=0, ge=0)
    experience_years: int = Field(default=0, ge=0)
    projects_count: int = Field(default=0, ge=0)

    # Metadata
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "artisans"
        indexes = [
            IndexModel("siret", unique=True),
            IndexModel([("location", "2dsphere")]),  # geo queries
            IndexModel("specialties"),
            IndexModel([("company_name", "text")]),  # full-text search
        ]
