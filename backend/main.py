"""FastAPI application entrypoint for Phase 2."""

from fastapi import FastAPI

from backend.routes.auth_routes import router as auth_router
from backend.routes.booking_routes import router as booking_router


app = FastAPI(
    title="Smart Local Service Orchestrator API",
    version="0.2.0",
    description="Headless authentication and user-owned booking API.",
)


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(booking_router)
