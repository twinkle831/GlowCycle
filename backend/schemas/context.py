from pydantic import BaseModel
from typing import Optional

class LifestyleInputs(BaseModel):
    sleep_hours: float
    water_ml: int
    stress_level: int
    exercise_done: bool
    diet_flags: list[str]
    makeup_hours: float

class SkinReport(BaseModel):
    acne_severity: int
    oiliness: int
    dryness: int
    redness: int
    dark_circles: int
    texture_roughness: int
    pigmentation: int
    overall_skin_health: int
    barrier_stress: bool
    immediate_concern: str
    observations: list[str]
    zones: dict
    user_id: str = ""
    image_hash: str = ""

class ContextBundle(BaseModel):
    user_id: str
    skin_report: SkinReport
    lifestyle: LifestyleInputs
    weather: dict
    cycle_day: Optional[int] = None
    cycle_length: Optional[int] = 28
    recent_products: list[str] = []
    skin_trend: str = "insufficient_data"
    last_active_used: dict = {}