"""Scrape the official MaPrimeRénov' barème and emit a self-contained JSON dataset.

Two pieces of data are produced:

  1. Income brackets (BLEU / JAUNE / VIOLET / ROSE) — scraped live from the
     two tables on https://france-renov.gouv.fr/bareme (hors Île-de-France
     and Outre-mer + Île-de-France), keyed by household size and geo zone.

  2. Aid amounts per type of work — loaded from a curated seed file at
     `backend/data/mpr_amounts_seed_{year}.json`. The Anah guide publishes
     these numbers as a PDF (no public structured endpoint), so the seed
     file is hand-compiled from the official document and committed to the
     repo. Source URL is stored alongside each row.

Output: backend/data/mpr_dataset_{year}.json (gitignored), consumed by
`seed_mpr_amounts.py` to populate MongoDB.

Usage:
    python -m scripts.scrape_mpr_bareme                 # default: year 2026
    python -m scripts.scrape_mpr_bareme --year 2026
    python -m scripts.scrape_mpr_bareme --output /tmp/out.json
"""

import argparse
import json
import logging
import re
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx
from bs4 import BeautifulSoup, Tag

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("scrape_mpr_bareme")

BAREME_URL = "https://france-renov.gouv.fr/bareme"
BACKEND_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_ROOT / "data"
DEFAULT_YEAR = 2026

# Match the first cell of each row. The france-renov.gouv.fr table uses
# bare digits ("1", "2", …) for sized rows and "Par personne supplémentaire"
# for the additive row.
ADDITIONAL_PATTERN = re.compile(r"personne\s+suppl", re.IGNORECASE)
PLAIN_SIZE_PATTERN = re.compile(r"^\s*([1-9]\d?)\s*$")


def _to_int(text: str) -> int | None:
    """Extract the first integer from a string, ignoring spaces and €."""
    if not text:
        return None
    cleaned = text.replace("\xa0", " ").replace(" ", "")
    match = re.search(r"\d+", cleaned)
    return int(match.group()) if match else None


def _classify_size(label: str) -> tuple[int, bool] | None:
    """Return (household_size, is_additional_person) for a row label."""
    if ADDITIONAL_PATTERN.search(label):
        return 0, True
    match = PLAIN_SIZE_PATTERN.match(label)
    if match:
        return int(match.group(1)), False
    return None


def _parse_threshold_table(table: Tag) -> list[dict[str, Any]]:
    """Parse one income-threshold table into a list of row dicts."""
    rows: list[dict[str, Any]] = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if len(cells) < 5:
            continue
        label = cells[0].get_text(" ", strip=True)
        size_info = _classify_size(label)
        if not size_info:
            continue
        size, is_additional = size_info

        # The four threshold cells are columns 1..4.
        bleu = _to_int(cells[1].get_text())
        jaune = _to_int(cells[2].get_text())
        violet = _to_int(cells[3].get_text())
        # Last column is "À partir de X €" (i.e., the lower bound for ROSE,
        # equal to violet_max + 1). We store violet_max only — the rose tier
        # is implicit (revenue > violet_max ⇒ ROSE).
        if bleu is None or jaune is None or violet is None:
            continue

        rows.append(
            {
                "household_size": size,
                "is_additional_person": is_additional,
                "bleu_max": bleu,
                "jaune_max": jaune,
                "violet_max": violet,
            }
        )
    return rows


def _zone_for_caption(caption_text: str) -> str:
    """Decide which zone a table corresponds to from its caption text."""
    txt = caption_text.lower()
    if "île-de-france" in txt and "hors" not in txt:
        return "idf"
    return "hors_idf"


def scrape_income_brackets(html: str) -> dict[str, list[dict[str, Any]]]:
    """Scrape both income-threshold tables from the barème HTML page."""
    soup = BeautifulSoup(html, "html.parser")
    out: dict[str, list[dict[str, Any]]] = {"hors_idf": [], "idf": []}

    for table in soup.find_all("table"):
        caption = table.find("caption")
        if not caption:
            # Fallback: look at the preceding heading.
            heading = table.find_previous(["h2", "h3", "h4"])
            caption_text = heading.get_text(" ", strip=True) if heading else ""
        else:
            caption_text = caption.get_text(" ", strip=True)

        zone = _zone_for_caption(caption_text)
        rows = _parse_threshold_table(table)
        if rows:
            out[zone] = rows
            logger.info("Parsed %d rows for zone=%s (caption='%s')", len(rows), zone, caption_text)

    if not out["hors_idf"] or not out["idf"]:
        raise RuntimeError(
            "Failed to scrape both income-bracket tables from %s — got hors_idf=%d, idf=%d"
            % (BAREME_URL, len(out["hors_idf"]), len(out["idf"]))
        )
    return out


def load_amounts_seed(year: int) -> dict[str, Any]:
    """Load the curated amounts seed file (compiled from the official PDF)."""
    path = DATA_DIR / f"mpr_amounts_seed_{year}.json"
    if not path.exists():
        raise FileNotFoundError(
            f"No amounts seed for year {year} at {path}. "
            f"Compile the table from the official Anah guide and save it there."
        )
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def build_dataset(year: int, html: str, amounts_seed: dict[str, Any]) -> dict[str, Any]:
    """Assemble the final dataset dict written to disk."""
    brackets = scrape_income_brackets(html)
    return {
        "year": year,
        "fetched_at": datetime.now(UTC).isoformat(),
        "income_brackets": {
            "source_url": BAREME_URL,
            "hors_idf": brackets["hors_idf"],
            "idf": brackets["idf"],
        },
        "amounts": {
            "source_url": amounts_seed["source_url"],
            "comment": amounts_seed.get("comment"),
            "items": amounts_seed["amounts"],
        },
    }


def main(year: int, output: Path) -> int:
    logger.info("Fetching %s …", BAREME_URL)
    resp = httpx.get(BAREME_URL, timeout=30, follow_redirects=True)
    resp.raise_for_status()

    amounts_seed = load_amounts_seed(year)
    dataset = build_dataset(year, resp.text, amounts_seed)

    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    logger.info(
        "Wrote dataset to %s (income rows: hors_idf=%d, idf=%d ; amounts: %d)",
        output,
        len(dataset["income_brackets"]["hors_idf"]),
        len(dataset["income_brackets"]["idf"]),
        len(dataset["amounts"]["items"]),
    )
    return 0


def cli() -> int:
    parser = argparse.ArgumentParser(description="Scrape MaPrimeRénov' barème into a JSON dataset")
    parser.add_argument("--year", type=int, default=DEFAULT_YEAR, help="Reference year of the barème")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output JSON path (default: backend/data/mpr_dataset_{year}.json)",
    )
    args = parser.parse_args()

    output = args.output or DATA_DIR / f"mpr_dataset_{args.year}.json"
    return main(args.year, output)


if __name__ == "__main__":
    sys.exit(cli())
