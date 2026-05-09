"""Seed the MaPrimeRénov' barème (amounts + income brackets) into MongoDB.

Reads the JSON dataset produced by `scrape_mpr_bareme.py`. Idempotent on the
unique key (year, work_type) for amounts and (year, zone, household_size,
is_additional_person) for income thresholds — re-running skips rows already
present.

Usage:
    python -m scripts.scrape_mpr_bareme --year 2026     # produce dataset
    python -m scripts.seed_mpr_amounts                  # seed (default year 2026)
    python -m scripts.seed_mpr_amounts --year 2026 --dry-run
    python -m scripts.seed_mpr_amounts --input /tmp/dataset.json
"""

import argparse
import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Any

from app.db.mongodb import close_mongo, connect_mongo
from app.models.mpr_amount import (
    GeoZone,
    MprAmount,
    MprIncomeThreshold,
    Unit,
    WorkType,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_mpr_amounts")

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_ROOT / "data"
DEFAULT_YEAR = 2026


def load_dataset(year: int, override: Path | None) -> dict[str, Any]:
    path = override or DATA_DIR / f"mpr_dataset_{year}.json"
    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {path}. Run `python -m scripts.scrape_mpr_bareme --year {year}` first."
        )
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def parse_amount(year: int, source_url: str, item: dict[str, Any]) -> MprAmount | None:
    try:
        return MprAmount(
            year=year,
            work_type=WorkType(item["work_type"]),
            label=item["label"],
            unit=Unit(item["unit"]),
            amount_bleu=item.get("amount_bleu"),
            amount_jaune=item.get("amount_jaune"),
            amount_violet=item.get("amount_violet"),
            amount_rose=item.get("amount_rose"),
            cap_amount=item.get("cap_amount"),
            notes=item.get("notes"),
            source_url=source_url,
        )
    except (KeyError, ValueError) as e:
        logger.warning("Skipping invalid amount row (%s): %s", item.get("work_type"), e)
        return None


def parse_threshold(
    year: int, zone: GeoZone, source_url: str, row: dict[str, Any]
) -> MprIncomeThreshold | None:
    try:
        return MprIncomeThreshold(
            year=year,
            zone=zone,
            household_size=int(row["household_size"]),
            is_additional_person=bool(row["is_additional_person"]),
            bleu_max=int(row["bleu_max"]),
            jaune_max=int(row["jaune_max"]),
            violet_max=int(row["violet_max"]),
            source_url=source_url,
        )
    except (KeyError, ValueError) as e:
        logger.warning("Skipping invalid threshold row (zone=%s): %s", zone, e)
        return None


async def upsert_amounts(amounts: list[MprAmount], dry_run: bool) -> tuple[int, int]:
    inserted = skipped = 0
    if not amounts:
        return 0, 0

    existing: set[tuple[int, str]] = set()
    if not dry_run:
        async for a in MprAmount.find_all():
            existing.add((a.year, a.work_type.value))
        logger.info("Found %d existing amount rows in DB", len(existing))

    to_insert = [a for a in amounts if (a.year, a.work_type.value) not in existing]
    skipped = len(amounts) - len(to_insert)

    if dry_run:
        logger.info("[DRY-RUN] Would insert %d amount rows (skipped=%d)", len(to_insert), skipped)
        return len(to_insert), skipped

    if to_insert:
        await MprAmount.insert_many(to_insert)
        inserted = len(to_insert)
        logger.info("Inserted %d amount rows", inserted)

    return inserted, skipped


async def upsert_thresholds(rows: list[MprIncomeThreshold], dry_run: bool) -> tuple[int, int]:
    inserted = skipped = 0
    if not rows:
        return 0, 0

    existing: set[tuple[int, str, int, bool]] = set()
    if not dry_run:
        async for t in MprIncomeThreshold.find_all():
            existing.add((t.year, t.zone.value, t.household_size, t.is_additional_person))
        logger.info("Found %d existing income-threshold rows in DB", len(existing))

    to_insert = [
        r
        for r in rows
        if (r.year, r.zone.value, r.household_size, r.is_additional_person) not in existing
    ]
    skipped = len(rows) - len(to_insert)

    if dry_run:
        logger.info("[DRY-RUN] Would insert %d threshold rows (skipped=%d)", len(to_insert), skipped)
        return len(to_insert), skipped

    if to_insert:
        await MprIncomeThreshold.insert_many(to_insert)
        inserted = len(to_insert)
        logger.info("Inserted %d threshold rows", inserted)

    return inserted, skipped


async def main(year: int, dataset_path: Path | None, dry_run: bool) -> int:
    dataset = load_dataset(year, dataset_path)
    if dataset.get("year") != year:
        logger.warning(
            "Dataset year (%s) differs from --year argument (%s) — using --year",
            dataset.get("year"),
            year,
        )

    # Beanie requires init_beanie() before any Document is instantiated.
    await connect_mongo(document_models=[MprAmount, MprIncomeThreshold])
    try:
        amounts_section = dataset["amounts"]
        amounts = [
            a
            for item in amounts_section["items"]
            if (a := parse_amount(year, amounts_section["source_url"], item)) is not None
        ]

        brackets_section = dataset["income_brackets"]
        thresholds: list[MprIncomeThreshold] = []
        for zone_key, rows in (
            ("hors_idf", brackets_section["hors_idf"]),
            ("idf", brackets_section["idf"]),
        ):
            zone = GeoZone(zone_key)
            for row in rows:
                t = parse_threshold(year, zone, brackets_section["source_url"], row)
                if t is not None:
                    thresholds.append(t)

        logger.info("Parsed %d amounts and %d income-threshold rows", len(amounts), len(thresholds))

        ai, _ = await upsert_amounts(amounts, dry_run)
        ti, _ = await upsert_thresholds(thresholds, dry_run)
        logger.info("Done — amounts inserted=%d, thresholds inserted=%d", ai, ti)
    finally:
        await close_mongo()
    return 0


def cli() -> int:
    parser = argparse.ArgumentParser(description="Seed MaPrimeRénov' barème into MongoDB")
    parser.add_argument("--year", type=int, default=DEFAULT_YEAR)
    parser.add_argument("--input", type=Path, default=None, help="Override dataset JSON path")
    parser.add_argument("--dry-run", action="store_true", help="Parse without inserting")
    args = parser.parse_args()
    return asyncio.run(main(args.year, args.input, args.dry_run))


if __name__ == "__main__":
    sys.exit(cli())
