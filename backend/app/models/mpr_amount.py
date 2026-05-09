from datetime import UTC, datetime
from enum import Enum

from beanie import Document
from pydantic import Field
from pymongo import IndexModel


class WorkType(str, Enum):
    """Types of works eligible to MaPrimeRénov' parcours par geste."""

    HEAT_PUMP_AIR_WATER = "heat_pump_air_water"
    HEAT_PUMP_GEOTHERMAL = "heat_pump_geothermal"
    SOLAR_COMBINED_SYSTEM = "solar_combined_system"
    SOLAR_WATER_HEATER = "solar_water_heater"
    PELLET_STOVE = "pellet_stove"
    WOOD_STOVE = "wood_stove"
    WOOD_INSERT = "wood_insert"
    PVT_THERMAL = "pvt_thermal"
    THERMODYNAMIC_WATER_HEATER = "thermodynamic_water_heater"
    HEAT_NETWORK_CONNECTION = "heat_network_connection"
    OIL_TANK_REMOVAL = "oil_tank_removal"
    ENERGY_AUDIT = "energy_audit"
    DOUBLE_FLOW_VMC = "double_flow_vmc"
    WINDOW_REPLACEMENT = "window_replacement"
    ROOF_TERRACE_INSULATION = "roof_terrace_insulation"
    ROOF_RAMPANT_INSULATION = "roof_rampant_insulation"
    SOLAR_RADIATION_PROTECTION = "solar_radiation_protection"


class IncomeBracket(str, Enum):
    """Income bracket determined by household tax revenue + size + geo zone."""

    BLEU = "bleu"
    JAUNE = "jaune"
    VIOLET = "violet"
    ROSE = "rose"


class Unit(str, Enum):
    """Unit attached to an MprAmount value."""

    FORFAIT = "forfait"
    PER_M2 = "per_m2"
    PER_EQUIPMENT = "per_equipment"
    PER_KW = "per_kw"


class GeoZone(str, Enum):
    IDF = "idf"
    HORS_IDF = "hors_idf"


class MprAmount(Document):
    """One MaPrimeRénov' aid amount for a (year, work_type) couple, by income bracket.

    Amounts are nullable: in 2026, ROSE households are no longer eligible to most
    parcours-par-geste works, and some works are no longer financed at all.
    """

    year: int
    work_type: WorkType
    label: str
    unit: Unit
    amount_bleu: float | None = None
    amount_jaune: float | None = None
    amount_violet: float | None = None
    amount_rose: float | None = None
    cap_amount: float | None = None
    notes: str | None = None
    source_url: str
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "mpr_amounts"
        indexes = [
            IndexModel([("year", 1), ("work_type", 1)], unique=True),
            IndexModel("work_type"),
        ]


class MprIncomeThreshold(Document):
    """Income brackets thresholds for MaPrimeRénov' (yearly + zone + household size).

    For sizes 1-5 the row is keyed by (year, zone, household_size) with
    is_additional_person=False. For households >5 persons, a single row with
    is_additional_person=True provides the increment to add per extra person.
    """

    year: int
    zone: GeoZone
    household_size: int
    is_additional_person: bool = False
    bleu_max: int
    jaune_max: int
    violet_max: int
    source_url: str
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "mpr_income_thresholds"
        indexes = [
            IndexModel(
                [
                    ("year", 1),
                    ("zone", 1),
                    ("household_size", 1),
                    ("is_additional_person", 1),
                ],
                unique=True,
            ),
        ]
