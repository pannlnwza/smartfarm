import pandas as pd
from fastapi import APIRouter, HTTPException
from typing import List
from ..models import HealthPredictionInput, HealthScore
from pathlib import Path
import joblib
from ..database import Database
from datetime import datetime, timezone, timedelta
import httpx

router = APIRouter()

model_path = Path(__file__).resolve().parent.parent / "ml" / "plant_health_score_model.pkl"
scaler_path = Path(__file__).resolve().parent.parent / "ml" / "scaler.pkl"
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)


@router.post("/predict-health")
async def predict_health(data: HealthPredictionInput):
    input_data = pd.DataFrame([{
        "temperature": data.temperature,
        "soil_moisture": data.soil_moisture,
        "humidity": data.humidity,
        "light_intensity": data.light_intensity
    }])

    try:
        input_scaled = scaler.transform(input_data)
        score = model.predict(input_scaled)[0]

        status = "Unhealthy"
        if score >= 80:
            status = "Excellent"
        elif score >= 60:
            status = "Healthy"
        elif score >= 40:
            status = "Fair"

        if data.save_to_history:
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


def convert_to_thai_time(utc_timestamp, timezone_offset):
    return datetime.utcfromtimestamp(utc_timestamp) + timedelta(seconds=timezone_offset)

# Example code to return the JSON response with Thai time
@router.get("/when-will-it-rain")
async def when_will_it_rain():
    url = (
        f"https://api.openweathermap.org/data/2.5/forecast?lat=13.8657&lon=100.462&appid=39f71571c877eea755c37feab37e4267&units=metric"
    )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

        now = datetime.now().timestamp()
        timezone_offset = data["city"]["timezone"]

        for forecast in data["list"]:
            dt = forecast["dt"]
            local_time = convert_to_thai_time(dt, timezone_offset)

            if dt > now and "rain" in forecast and forecast["rain"].get("3h", 0) > 0:
                time_until_rain = dt - now
                hours = int(time_until_rain // 3600)
                days = hours // 24
                remaining_hours = hours % 24

                return {
                    "status": "rain_expected",
                    "summary": {
                        "message": f"It will likely rain in {days} day(s) and {remaining_hours} hour(s).",
                        "time_until_rain": {
                            "days": days,
                            "hours": remaining_hours
                        },
                    },
                    "forecast": {
                        "datetime_local": local_time.strftime("%Y-%m-%d %H:%M:%S"),  # Local time in Thailand
                        "timestamp": dt,
                        "rain_mm": forecast["rain"]["3h"],
                        "temperature": forecast["main"]["temp"],
                        "weather": forecast["weather"][0]["main"],
                        "description": forecast["weather"][0]["description"]
                    }
                }

        return {"message": "No rain expected in the next 5 days."}

    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather: {str(e)}")