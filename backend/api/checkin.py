import json, asyncio, hashlib, tempfile, os
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from agents.skin_vision_agent import analyze_skin
from agents.routine_planner_agent import plan_routine
from schemas.context import ContextBundle, LifestyleInputs, SkinReport
from tools.weather import get_weather
from db.skin_logs import save_skin_report, get_skin_trend

router = APIRouter()

@router.post("/checkin")
async def daily_checkin(image: UploadFile = File(...), data: str = Form(...)):
    payload   = json.loads(data)
    user_id   = payload["user_id"]
    lifestyle = LifestyleInputs(**payload["lifestyle"])

    async def stream():
        img_bytes = await image.read()
        img_hash  = hashlib.md5(img_bytes).hexdigest()
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
            f.write(img_bytes)
            tmp = f.name
        try:
            yield f"data: {json.dumps({'step':'analyzing_skin'})}\n\n"
            skin = await analyze_skin(tmp, user_id)
            skin["image_hash"] = img_hash
            skin["user_id"]    = user_id
            await save_skin_report(skin)
            yield f"data: {json.dumps({'step':'skin_done','report':skin})}\n\n"

            yield f"data: {json.dumps({'step':'fetching_context'})}\n\n"
            weather, trend = await asyncio.gather(
                get_weather(), get_skin_trend(user_id)
            )

            ctx = ContextBundle(
                user_id=user_id,
                skin_report=SkinReport(**skin),
                lifestyle=lifestyle,
                weather=weather,
                skin_trend=trend["trend"],
            )

            yield f"data: {json.dumps({'step':'planning_routine'})}\n\n"
            routine = await plan_routine(ctx)
            yield f"data: {json.dumps({'step':'done','routine':routine})}\n\n"
        finally:
            os.unlink(tmp)

    return StreamingResponse(stream(), media_type="text/event-stream")

@router.get("/routine/{user_id}")
async def get_routine(user_id: str):
    from db.skin_logs import get_latest_routine
    from fastapi import HTTPException
    r = await get_latest_routine(user_id)
    if not r:
        raise HTTPException(404, "No routine found")
    return r

@router.get("/history/{user_id}")
async def get_history(user_id: str, days: int = 14):
    return await get_skin_trend(user_id, days)