import httpx
import os
from dotenv import load_dotenv
load_dotenv()

async def get_weather(lat: float = 28.6, lon: float = 77.2) -> dict:
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key or api_key == "your_key_here":
        return {
            "temp_c": 28,
            "humidity_pct": 60,
            "uv_index": 6,
            "description": "clear sky"
        }
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        )
        weather = r.json()
        try:
            uv_r = await client.get(
                f"https://api.openweathermap.org/data/2.5/uvi"
                f"?lat={lat}&lon={lon}&appid={api_key}"
            )
            uv = uv_r.json().get("value", 5)
        except Exception:
            uv = 5
    return {
        "temp_c": round(weather["main"]["temp"], 1),
        "humidity_pct": weather["main"]["humidity"],
        "uv_index": uv,
        "description": weather["weather"][0]["description"],
    }