from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.artisan import Specialty


class CertificationResponse(BaseModel):
    name: str
    code: str | None = None
    valid_until: datetime | None = None


class ArtisanResponse(BaseModel):
    id: str
    company_name: str
    siret: str
    email: EmailStr | None = None
    phone: str | None = None
    about: str | None = None
    specialties: list[Specialty]
    certifications: list[CertificationResponse]
    address: str
    postal_code: str
    city: str
    latitude: float
    longitude: float
    rating: float
    reviews_count: int
    experience_years: int
    projects_count: int
    distance_km: float | None = None  # filled when results come from geo query


class ArtisanListResponse(BaseModel):
    items: list[ArtisanResponse]
    total: int
