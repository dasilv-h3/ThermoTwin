from typing import Annotated

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user
from app.models.artisan import Artisan, Specialty
from app.models.user import User
from app.schemas.artisan import ArtisanListResponse, ArtisanResponse, CertificationResponse
from app.services.geo import haversine_km

router = APIRouter(prefix="/artisans", tags=["Artisans"])


def _serialize(artisan: Artisan, distance_km: float | None = None) -> ArtisanResponse:
    return ArtisanResponse(
        id=str(artisan.id),
        company_name=artisan.company_name,
        siret=artisan.siret,
        email=artisan.email,
        phone=artisan.phone,
        about=artisan.about,
        specialties=artisan.specialties,
        certifications=[CertificationResponse(**c.model_dump()) for c in artisan.certifications],
        address=artisan.address,
        postal_code=artisan.postal_code,
        city=artisan.city,
        latitude=artisan.location.coordinates[1],
        longitude=artisan.location.coordinates[0],
        rating=artisan.rating,
        reviews_count=artisan.reviews_count,
        experience_years=artisan.experience_years,
        projects_count=artisan.projects_count,
        distance_km=distance_km,
    )


@router.get("", response_model=ArtisanListResponse)
async def list_artisans(
    _user: Annotated[User, Depends(get_current_user)],
    lat: float | None = Query(None, description="Latitude for geo search"),
    lng: float | None = Query(None, description="Longitude for geo search"),
    radius_km: float = Query(30, ge=1, le=200, description="Search radius in kilometers"),
    specialty: Specialty | None = Query(None, description="Filter by specialty"),
    postal_code: str | None = Query(None, description="Filter by postal code prefix"),
    search: str | None = Query(None, description="Full-text search on company name"),
    limit: int = Query(50, ge=1, le=200),
):
    """List RGE artisans with optional geo, specialty and search filters."""
    query: dict = {"is_active": True}

    if specialty:
        query["specialties"] = specialty
    if postal_code:
        query["postal_code"] = {"$regex": f"^{postal_code}"}
    if search:
        query["$text"] = {"$search": search}

    if lat is not None and lng is not None:
        query["location"] = {
            "$near": {
                "$geometry": {"type": "Point", "coordinates": [lng, lat]},
                "$maxDistance": int(radius_km * 1000),
            }
        }

    cursor = Artisan.find(query).limit(limit)
    artisans = await cursor.to_list()

    items = [_serialize(a) for a in artisans]
    return ArtisanListResponse(items=items, total=len(items))


@router.get("/nearby", response_model=ArtisanListResponse)
async def nearby_artisans(
    _user: Annotated[User, Depends(get_current_user)],
    lat: float = Query(..., ge=-90, le=90, description="Latitude (WGS84)"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude (WGS84)"),
    limit: int = Query(10, ge=1, le=20, description="Number of artisans to return"),
    specialty: Specialty | None = Query(None, description="Optional specialty filter"),
):
    """Return the N closest active RGE artisans to a given point.

    Reusable across the scan history detail view (GPTT-252) and the PDF
    report (GPTT-254). MongoDB's `$near` already sorts by distance ; we
    additionally compute and expose `distance_km` per item so the caller
    can render it without re-fetching coordinates.
    """
    query: dict = {
        "is_active": True,
        "location": {
            "$near": {
                "$geometry": {"type": "Point", "coordinates": [lng, lat]},
                # No $maxDistance: the goal is "N closest", any distance.
            }
        },
    }
    if specialty:
        query["specialties"] = specialty

    artisans = await Artisan.find(query).limit(limit).to_list()
    items = [
        _serialize(
            a,
            distance_km=round(
                haversine_km(lat, lng, a.location.coordinates[1], a.location.coordinates[0]),
                2,
            ),
        )
        for a in artisans
    ]
    return ArtisanListResponse(items=items, total=len(items))


@router.get("/{artisan_id}", response_model=ArtisanResponse)
async def get_artisan(
    artisan_id: str,
    _user: Annotated[User, Depends(get_current_user)],
):
    try:
        oid = PydanticObjectId(artisan_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid artisan id")

    artisan = await Artisan.get(oid)
    if not artisan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artisan not found")
    return _serialize(artisan)
