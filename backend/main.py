"""FastAPI application entrypoint for the Phase 2 and Phase 3 backend."""

from fastapi import FastAPI

from backend.routes.auth_routes import router as auth_router
from backend.routes.booking_routes import router as booking_router
from backend.routes.service_request_routes import router as service_request_router


app = FastAPI(
    title="Smart Local Service Orchestrator API",
    version="0.3.0",
    description="Authenticated service orchestration and user-owned booking API.",
)


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(booking_router)
app.include_router(service_request_router)
