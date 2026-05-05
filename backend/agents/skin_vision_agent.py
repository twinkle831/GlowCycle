import httpx
import base64
import json
import hashlib
from pathlib import Path
import os
from dotenv import load_dotenv
load_dotenv()

SYSTEM_PROMPT = """You are a clinical skin analysis assistant. Analyse the facial
skin in the provided image. Return ONLY valid JSON — no preamble, no markdown fences.
Score each attribute from 0 (none/clear) to 10 (severe/extreme)."""

USER_PROMPT = """Analyse this skin image and return JSON with exactly these keys:
acne_severity, oiliness, dryness, redness, dark_circles, texture_roughness,
pigmentation, overall_skin_health (all int 0-10),
observations (list of 2-3 strings),
zones (object: forehead/nose/chin/cheeks with sub-scores),
barrier_stress (bool), immediate_concern (string)."""

async def analyze_skin(image_path: str, user_id: str) -> dict:
    image_bytes = Path(image_path).read_bytes()
    b64 = base64.b64encode(image_bytes).decode()
    vision_url = os.getenv("VLLM_VISION_URL", "http://localhost:8001/v1")

    payload = {
        "model": "llava-hf/llava-1.5-7b-hf",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "image_url",
                 "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                {"type": "text", "text": USER_PROMPT}
            ]}
        ],
        "max_tokens": 800,
        "temperature": 0.1
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(f"{vision_url}/chat/completions", json=payload)
        raw = r.json()["choices"][0]["message"]["content"]

    clean = raw.strip()
    if "```" in clean:
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip()

    data = json.loads(clean)
    data["user_id"] = user_id
    data["image_hash"] = hashlib.md5(image_bytes).hexdigest()
    return data