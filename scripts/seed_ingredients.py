import asyncio
import asyncpg
import os
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
load_dotenv("backend/.env")

INGREDIENTS = [
    {
        "name": "Niacinamide", "inci_name": "Niacinamide", "category": "active",
        "benefits": ["brightening","pore-minimising","oil-control","barrier-repair"],
        "warnings": ["may conflict with Vitamin C at high concentrations"],
        "content": "Niacinamide (Vitamin B3) reduces pore appearance, controls sebum, fades hyperpigmentation, and strengthens the skin barrier. Effective at 2-10%. Well tolerated by all skin types."
    },
    {
        "name": "Retinol", "inci_name": "Retinol", "category": "active",
        "benefits": ["anti-aging","cell-turnover","acne","texture"],
        "warnings": ["avoid with AHA/BHA same night","sun sensitivity","avoid in pregnancy"],
        "content": "Retinol is a Vitamin A derivative that accelerates cell turnover, reduces fine lines, and treats acne. Use PM only. Always pair with SPF next morning. Pause if barrier stress detected."
    },
    {
        "name": "Salicylic Acid", "inci_name": "Salicylic Acid", "category": "active",
        "benefits": ["acne","exfoliation","oil-control","pore-clearing"],
        "warnings": ["do not combine with retinol same step","over-exfoliation risk >3x/week"],
        "content": "Salicylic acid (BHA) is oil-soluble, penetrates pores, dissolves blackheads. Best for oily/acne-prone skin. Use 0.5-2%."
    },
    {
        "name": "Ceramide NP", "inci_name": "Ceramide NP", "category": "barrier",
        "benefits": ["barrier-repair","hydration","sensitive-skin"],
        "warnings": [],
        "content": "Ceramides replenish the skin's protective lipid barrier, prevent water loss, and are essential for barrier repair. Ideal for dry and sensitive skin."
    },
    {
        "name": "Hyaluronic Acid", "inci_name": "Sodium Hyaluronate", "category": "humectant",
        "benefits": ["hydration","plumping","all-skin-types"],
        "warnings": ["apply on damp skin"],
        "content": "Hyaluronic acid draws moisture into the skin. Apply on damp skin and seal with moisturiser. Suitable for all skin types."
    },
    {
        "name": "Centella Asiatica", "inci_name": "Centella Asiatica Extract", "category": "soothing",
        "benefits": ["redness-reduction","healing","barrier-repair"],
        "warnings": [],
        "content": "Centella asiatica calms inflammation, reduces redness, and accelerates healing. Excellent for post-breakout recovery and barrier stress."
    },
]

async def seed():
    print("Loading embedding model...")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    conn  = await asyncpg.connect(os.getenv("POSTGRES_URL"))
    print("Seeding ingredients...")
    for ing in INGREDIENTS:
        text = f"{ing['name']}. {ing['content']} Benefits: {', '.join(ing['benefits'])}."
        emb  = model.encode(text).tolist()
        await conn.execute("""
            INSERT INTO ingredients (name, inci_name, category, benefits, warnings, content, embedding)
            VALUES ($1,$2,$3,$4,$5,$6,$7::vector)
            ON CONFLICT DO NOTHING
        """, ing["name"], ing["inci_name"], ing["category"],
            ing["benefits"], ing["warnings"], ing["content"], str(emb))
        print(f"  ✓ {ing['name']}")
    await conn.close()
    print("Done.")

asyncio.run(seed())