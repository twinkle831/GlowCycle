from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.checkin import router as checkin_router
from api.products import router as products_router

app = FastAPI(title="Glow Cycle API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checkin_router, prefix="/api")
app.include_router(products_router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}