"""Seed the artisans collection from the official ADEME RGE registry.

Source: https://data.ademe.fr/datasets/liste-des-entreprises-rge-2

Usage:
    python -m scripts.seed_artisans                       # default: IDF, no limit
    python -m scripts.seed_artisans --departement 75      # only Paris
    python -m scripts.seed_artisans --limit 100           # cap at 100 inserts
    python -m scripts.seed_artisans --departement 75 92 93 94  # multiple
    python -m scripts.seed_artisans --dry-run             # parse + map, no insert
"""

import argparse
import asyncio
import logging
import sys
from typing import Any

import httpx

from app.db.mongodb import close_mongo, connect_mongo
from app.models.artisan import Artisan, Certification, Location, Specialty

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_artisans")

ADEME_DATASET_ID = "eo1n335dwa-ul7glxa7lm1ho"  # "Liste des entreprises RGE - New"
ADEME_API = f"https://data.ademe.fr/data-fair/api/v1/datasets/{ADEME_DATASET_ID}/lines"
PAGE_SIZE = 1000  # max allowed by ADEME data-fair
DEFAULT_DEPARTEMENTS = ["75", "77", "78", "91", "92", "93", "94", "95"]  # Île-de-France


def map_specialty(domaine: str) -> Specialty | None:
    """Map an ADEME `domaine_travaux` string to our Specialty enum."""
    if not domaine:
        return None
    d = domaine.lower()

    if "isolation" in d:
        if "combles" in d or "toit" in d:
            return Specialty.ROOF_INSULATION
        if "plancher" in d or "sol" in d:
            return Specialty.FLOOR_INSULATION
        return Specialty.WALL_INSULATION
    if "fenêtre" in d or "menuiserie" in d or "vitr" in d:
        return Specialty.WINDOW_REPLACEMENT
    if "pompe à chaleur" in d or "pac" in d:
        return Specialty.HEAT_PUMP
    if "chaudière" in d or "chauffage" in d or "poêle" in d:
        return Specialty.HEATING
    if "ventilation" in d or "vmc" in d:
        return Specialty.VENTILATION
    if "photovolt" in d or "solaire" in d:
        return Specialty.SOLAR_PANELS
    return Specialty.OTHER


def _clean(value: Any) -> str:
    """Strip control characters (incl. null bytes) and surrounding whitespace."""
    if not value:
        return ""
    return "".join(c for c in str(value) if c.isprintable()).strip()


def _clean_email(value: Any) -> str | None:
    """Return a clean email or None if invalid."""
    cleaned = _clean(value)
    if not cleaned or "@" not in cleaned:
        return None
    return cleaned


def parse_row(row: dict[str, Any]) -> Artisan | None:
    """Convert one ADEME row to an Artisan document. Returns None if invalid."""
    siret = _clean(row.get("siret"))
    name = _clean(row.get("nom_entreprise"))
    if not siret or not name:
        return None

    # Coordinates: ADEME uses lat/lng as floats
    try:
        lat = float(row.get("latitude") or 0)
        lng = float(row.get("longitude") or 0)
    except (TypeError, ValueError):
        return None
    if lat == 0 and lng == 0:
        return None  # missing geo, skip

    # Specialties
    domaine = row.get("domaine") or ""
    specialty = map_specialty(domaine)
    specialties = [specialty] if specialty else []

    # Certifications: combine nom_certificat + nom_qualification when present
    cert_parts = [row.get("nom_certificat"), row.get("nom_qualification")]
    cert_name = " - ".join(p.strip() for p in cert_parts if p)
    certs = [Certification(name=cert_name, code=row.get("code_qualification"))] if cert_name else []

    try:
        return Artisan(
            company_name=name,
            siret=siret,
            email=_clean_email(row.get("email")),
            phone=_clean(row.get("telephone")) or None,
            about=domaine or None,
            specialties=specialties,
            certifications=certs,
            address=_clean(row.get("adresse")) or "—",
            postal_code=_clean(row.get("code_postal")),
            city=_clean(row.get("commune")),
            location=Location(coordinates=[lng, lat]),  # GeoJSON: [lng, lat]
        )
    except Exception as e:
        logger.debug("Skipping invalid row (siret=%s): %s", siret, e)
        return None


async def fetch_artisans(client: httpx.AsyncClient, departements: list[str], limit: int | None) -> list[dict[str, Any]]:
    """Fetch artisans from ADEME API with pagination, filtered by departement."""
    rows: list[dict[str, Any]] = []
    after: str | None = None
    qs = "(" + " OR ".join(f"code_postal:{d}*" for d in departements) + ")"

    while True:
        params: dict[str, Any] = {
            "size": PAGE_SIZE,
            "qs": qs,
            "select": (
                "siret,nom_entreprise,adresse,code_postal,commune,"
                "latitude,longitude,telephone,email,"
                "nom_certificat,nom_qualification,code_qualification,domaine"
            ),
        }
        if after:
            params["after"] = after

        resp = await client.get(ADEME_API, params=params, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results", [])
        if not results:
            break

        rows.extend(results)
        logger.info("Fetched %d / %s total", len(rows), data.get("total", "?"))

        if limit and len(rows) >= limit:
            rows = rows[:limit]
            break

        # data-fair uses `next` URL or we paginate via `after`
        next_url = data.get("next")
        if not next_url:
            break
        # extract `after` cursor from next_url
        import urllib.parse

        qs_dict = urllib.parse.parse_qs(urllib.parse.urlparse(next_url).query)
        after = qs_dict.get("after", [None])[0]
        if not after:
            break

    return rows


async def upsert_artisans(rows: list[dict[str, Any]], dry_run: bool) -> tuple[int, int, int]:
    """Insert artisans skipping existing SIRETs. Returns (inserted, skipped, invalid)."""
    inserted = skipped = invalid = 0

    # Pre-fetch existing SIRETs in one query for idempotency
    existing_sirets: set[str] = set()
    if not dry_run:
        async for a in Artisan.find({}, projection_model=None).project(Artisan):
            existing_sirets.add(a.siret)
        logger.info("Found %d existing artisans in DB", len(existing_sirets))

    artisans_to_insert: list[Artisan] = []
    for row in rows:
        artisan = parse_row(row)
        if artisan is None:
            invalid += 1
            continue
        if artisan.siret in existing_sirets:
            skipped += 1
            continue
        existing_sirets.add(artisan.siret)  # avoid in-batch duplicates
        artisans_to_insert.append(artisan)

    if dry_run:
        logger.info("[DRY-RUN] Would insert %d artisans", len(artisans_to_insert))
        return len(artisans_to_insert), skipped, invalid

    if artisans_to_insert:
        # Batch insert in chunks
        CHUNK = 500
        for i in range(0, len(artisans_to_insert), CHUNK):
            batch = artisans_to_insert[i : i + CHUNK]
            await Artisan.insert_many(batch)
            inserted += len(batch)
            logger.info("Inserted %d / %d", inserted, len(artisans_to_insert))

    return inserted, skipped, invalid


async def main(departements: list[str], limit: int | None, dry_run: bool) -> int:
    logger.info(
        "Seeding artisans (departements=%s, limit=%s, dry_run=%s)",
        departements,
        limit or "none",
        dry_run,
    )

    await connect_mongo(document_models=[Artisan])

    try:
        async with httpx.AsyncClient() as client:
            rows = await fetch_artisans(client, departements, limit)
        logger.info("Fetched %d rows from ADEME", len(rows))

        inserted, skipped, invalid = await upsert_artisans(rows, dry_run)
        logger.info(
            "Done — inserted=%d, skipped=%d (already in DB), invalid=%d",
            inserted,
            skipped,
            invalid,
        )
    finally:
        await close_mongo()

    return 0


def cli() -> int:
    parser = argparse.ArgumentParser(description="Seed Artisan collection from ADEME RGE registry")
    parser.add_argument(
        "--departement",
        nargs="+",
        default=DEFAULT_DEPARTEMENTS,
        help="Departement codes to filter on (default: Île-de-France)",
    )
    parser.add_argument("--limit", type=int, default=None, help="Cap total inserts")
    parser.add_argument("--dry-run", action="store_true", help="Parse + map without inserting")
    args = parser.parse_args()

    return asyncio.run(main(args.departement, args.limit, args.dry_run))


if __name__ == "__main__":
    sys.exit(cli())
