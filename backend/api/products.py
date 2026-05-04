from fastapi import APIRouter
from tools.rag_search import search_ingredients

router = APIRouter()

@router.get("/products/search")
async def search_products(query: str, budget: int = 0):
    results = await search_ingredients(query, limit=6)
    return {"results": results, "query": query}