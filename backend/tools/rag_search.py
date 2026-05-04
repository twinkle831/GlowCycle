import asyncpg
import os
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
load_dotenv()

_model = None

def get_embed_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _model

async def search_ingredients(query: str, limit: int = 5) -> list[dict]:
    model = get_embed_model()
    embedding = model.encode(query).tolist()
    conn = await asyncpg.connect(os.getenv("POSTGRES_URL"))
    try:
        rows = await conn.fetch("""
            SELECT name, inci_name, category, benefits, warnings, content,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM ingredients
            ORDER BY embedding <=> $1::vector
            LIMIT $2
        """, str(embedding), limit)
        return [dict(r) for r in rows]
    finally:
        await conn.close()