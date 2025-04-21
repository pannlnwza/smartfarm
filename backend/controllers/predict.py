import pandas as pd
from fastapi import APIRouter, HTTPException, Body
from typing import List
from ..models import HealthPredictionInput, HealthScore, WateringRequest, MoisturePredictionInput
from pathlib import Path
import joblib
from ..database import Database
from datetime import datetime, timezone, timedelta
import httpx


router = APIRouter()

@router.post("/predict-health")
async def predict_health(data: HealthPredictionInput):

    model_path = Path(__file__).resolve().parent.parent / "ml" / "plant_health_score_model.pkl"
    scaler_path = Path(__file__).resolve().parent.parent / "ml" / "scaler.pkl"
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    try:
        check_query = """
        SELECT health_status, ts 
        FROM plant_health 
        WHERE sensor_id = %s 
        ORDER BY ts DESC 
        LIMIT 1
        """
        existing = Database.fetch_one(check_query, (data.sensor_id,))

        if existing:
            return {
                "health_status": existing["health_status"],
                "message": "Retrieved from history",
                "timestamp": existing["ts"]
            }

        input_data = pd.DataFrame([{
            "ambient_temperature": data.temperature,
            "soil_moisture": data.soil_moisture,
            "humidity": data.humidity,
            "light_intensity": data.light_intensity
        }])

        input_scaled = scaler.transform(input_data)
        status = model.predict(input_scaled)[0]

        if data.save_to_history:
            save_query = """
            INSERT INTO plant_health (ts, sensor_id, health_status)
            VALUES (%s, %s, %s)
            """
            Database.execute_insert(save_query, (datetime.now(), data.sensor_id, status))

        return {
            "health_status": status,
            "message": "Predicted and saved" if data.save_to_history else "Predicted"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@router.get("/health-history", response_model=List[HealthScore])
async def get_health_history():
    query = """
        SELECT ts as timestamp, health_status
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

        return {"forecast": None}

    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather: {str(e)}")
    

@router.post("/watering-recommendation")
async def watering_recommendation(request: WateringRequest = Body(...)):
    moisture = request.moisture
    temperature = request.temperature
    lux = request.lux
    datetime_local = request.datetime_local
    print(datetime_local)

    hours_until_rain = None

    if datetime_local:
        try:
            rain_dt = datetime.strptime(datetime_local, "%Y-%m-%d %H:%M:%S")
            now = datetime.now()
            delta = rain_dt - now
            hours_until_rain = delta.total_seconds() / 3600
        except ValueError:
            return {"status": "error", "message": "Invalid datetime format"}

    if hours_until_rain is not None and hours_until_rain <= 24:
        if moisture >= 50:
            advice = "No need to water. Rain is coming and soil is moist."
        else:
            advice = "Hold off watering. Rain is expected soon."
    else:
        if moisture < 30:
            if hours_until_rain is not None:
                advice = f"The soil is very dry, and rain isn't expected for another {hours_until_rain:.0f} hours. Better to water your plants now to keep them healthy."
            else:
                advice = "The soil is very dry, and there's no rain forecasted. It's a good time to water your plants."
        elif temperature > 35 or lux > 10000:
            advice = "Water lightly. Conditions are hot or very sunny."
        elif moisture < 50:
            advice = "Optional watering. Soil is moderately moist."
        else:
            advice = "No watering needed. Soil is healthy."

    return {
        "status": "ok",
        "moisture": moisture,
        "temperature": temperature,
        "lux": lux,
        "datetime_local": datetime_local,
        "hours_until_rain": hours_until_rain,
        "recommendation": advice
    }


@router.post("/predict-moisture")
async def predict_health(data: MoisturePredictionInput):

    model_path = Path(__file__).resolve().parent.parent / "ml" / "plant_moisture_model.pkl"
    scaler_path = Path(__file__).resolve().parent.parent / "ml" / "scaler_moisture.pkl"
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    try:
        input_data = pd.DataFrame([{
            "ambient_temperature": data.temperature,
            "humidity": data.humidity,
            "light_intensity": data.light_intensity
        }])

        input_scaled = scaler.transform(input_data)
        moisture = model.predict(input_scaled)[0]

        return {
            "soil_moisture": moisture,
            "message": "Predicted"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
