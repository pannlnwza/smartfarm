from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS
from .controllers import sensor, weather, sun, predict

app = FastAPI(title="Soil Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sensor.router, prefix="/api", tags=["sensors"])
app.include_router(weather.router, prefix="/api", tags=["weather"])
app.include_router(sun.router, prefix="/api", tags=["sun"])
app.include_router(predict.router, prefix="/api", tags=["predict"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)