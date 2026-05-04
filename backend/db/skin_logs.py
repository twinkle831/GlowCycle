import asyncpg
import os
import json
from dotenv import load_dotenv
load_dotenv()

async def save_skin_report(report: dict):
    conn = await asyncpg.connect(os.getenv("POSTGRES_URL"))
    try:
        await conn.execute("""
            INSERT INTO skin_logs (
                user_id, image_hash, acne_severity, oiliness, dryness,
                redness, dark_circles, texture_roughness, pigmentation,
                overall_skin_health, barrier_stress, immediate_concern,
                zones_json, observations_json
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
            ON CONFLICT (user_id, image_hash) DO NOTHING
        """,
            report["user_id"], report["image_hash"],
            report["acne_severity"], report["oiliness"], report["dryness"],
            report["redness"], report["dark_circles"], report["texture_roughness"],
            report["pigmentation"], report["overall_skin_health"],
            report["barrier_stress"], report["immediate_concern"],
            json.dumps(report.get("zones", {})),
            json.dumps(report.get("observations", [])),
        )
    finally:
        await conn.close()

async def get_skin_trend(user_id: str, days: int = 7) -> dict:
    conn = await asyncpg.connect(os.getenv("POSTGRES_URL"))
    try:
        rows = await conn.fetch("""
            SELECT created_at, overall_skin_health, acne_severity, redness
            FROM skin_logs WHERE user_id = $1
            ORDER BY created_at DESC LIMIT $2
        """, user_id, days)
        if not rows:
            return {"trend": "insufficient_data", "history": []}
        scores = [r["overall_skin_health"] for r in rows]
        if len(scores) >= 6:
            recent = sum(scores[:3]) / 3
            older  = sum(scores[3:6]) / 3
            trend  = "worsening" if recent < older - 1 else \
                     "improving" if recent > older + 1 else "stable"
        else:
            trend = "insufficient_data"
        return {"trend": trend, "history": [dict(r) for r in rows]}
    finally:
        await conn.close()

async def get_latest_routine(user_id: str):
    conn = await asyncpg.connect(os.getenv("POSTGRES_URL"))
    try:
        row = await conn.fetchrow("""
            SELECT am_routine, pm_routine, paused_actives,
                   skin_message, urgency, created_at
            FROM routine_logs WHERE user_id = $1
            ORDER BY created_at DESC LIMIT 1
        """, user_id)
        return dict(row) if row else None
    finally:
        await conn.close()