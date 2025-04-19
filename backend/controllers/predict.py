import pandas as pd
from fastapi import APIRouter, HTTPException
from typing import List
from ..models import HealthPredictionInput, HealthScore
from pathlib import Path
import joblib
from ..database import Database
from datetime import datetime

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
        
        # Save the health score to database
        save_query = """
        INSERT INTO plant_health (ts, health_score, health_status)
        VALUES (%s, %s, %s)
        """
        Database.execute_insert(save_query, (datetime.now(), round(score, 1), status))

        return {
            "health_score": round(score, 1),
            "health_status": status
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@router.get("/health-history", response_model=List[HealthScore])
async def get_health_history():
    query = """
        SELECT ts as timestamp, health_score, health_status
        FROM plant_health
        WHERE ts > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY ts ASC
    """
    data = Database.execute_query(query)
    
    if not data:
        raise HTTPException(status_code=404, detail="No health history found")
    
    return data