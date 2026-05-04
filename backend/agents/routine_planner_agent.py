import httpx
import json
import os
from schemas.context import ContextBundle
from dotenv import load_dotenv
load_dotenv()

RULES = """
PAUSE RULES — apply strictly:
- barrier_stress = true → pause ALL actives tonight
- redness >= 7 → pause retinol + AHA minimum 3 days
- uv_index >= 6 → SPF 50 mandatory in AM
- sleep_hours < 5 → reduce all actives
- stress_level >= 8 → barrier repair only
- cycle_day 23-28 → add BHA preventively

CONFLICTS — never combine same routine:
- Retinol + AHA/BHA same night
- Retinol + Vitamin C (use Vit C AM, retinol PM)
- Benzoyl peroxide + Retinol
"""

SYSTEM = f"""You are a dermatologist AI. Build a daily skincare routine.
{RULES}
Return ONLY valid JSON:
{{
  "am_routine": [{{"step":1,"product_type":"","reason":"","key_ingredient":""}}],
  "pm_routine": [{{"step":1,"product_type":"","reason":"","key_ingredient":""}}],
  "paused_today": [],
  "pause_reasons": {{}},
  "lifestyle_flags": [],
  "skin_message": "",
  "urgency": "low|medium|high"
}}
Max 5 steps per routine."""

async def plan_routine(ctx: ContextBundle) -> dict:
    msg = f"""
Skin: acne={ctx.skin_report.acne_severity}, redness={ctx.skin_report.redness},
oiliness={ctx.skin_report.oiliness}, dryness={ctx.skin_report.dryness},
barrier_stress={ctx.skin_report.barrier_stress}, trend={ctx.skin_trend}
Lifestyle: sleep={ctx.lifestyle.sleep_hours}h, stress={ctx.lifestyle.stress_level},
water={ctx.lifestyle.water_ml}ml, diet={ctx.lifestyle.diet_flags}
Weather: UV={ctx.weather.get('uv_index')}, temp={ctx.weather.get('temp_c')}C
Cycle day: {ctx.cycle_day or 'not tracked'} of {ctx.cycle_length}
"""
    text_url = os.getenv("VLLM_TEXT_URL", "http://localhost:8000/v1")
    payload = {
        "model": "meta-llama/Meta-Llama-3-8B-Instruct",
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user",   "content": msg}
        ],
        "max_tokens": 1000,
        "temperature": 0.2
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(f"{text_url}/chat/completions", json=payload)
        raw = r.json()["choices"][0]["message"]["content"]

    clean = raw.strip()
    if "```" in clean:
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    return json.loads(clean.strip())