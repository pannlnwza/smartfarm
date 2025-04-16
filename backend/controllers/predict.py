import pandas as pd
from fastapi import APIRouter, HTTPException
from ..models import HealthPredictionInput
from pathlib import Path
import joblib

router = APIRouter()

model_path = Path(__file__).resolve().parent.parent / "ml" / "plant_health_score_model.pkl"
model = joblib.load(model_path)

@router.post("/predict-health")
async def predict_health(data: HealthPredictionInput):
    input_data = pd.DataFrame([{
        "temperature": data.temperature,
        "soil_moisture": data.soil_moisture,
        "humidity": data.humidity,
        "light_intensity": data.light_intensity
    }])

    try:
        score = model.predict(input_data)[0]

        status = "Unhealthy"
        if score >= 80:
            status = "Excellent"
        elif score >= 60:
            status = "Healthy"
        elif score >= 40:
            status = "Fair"

        return {
            "health_score": round(score, 1),
            "health_status": status
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
