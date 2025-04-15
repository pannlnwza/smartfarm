from fastapi import APIRouter, HTTPException
from ..models import WeatherData
from ..database import Database

router = APIRouter()

@router.get("/weather-data", response_model=WeatherData)
async def get_weather_data():
    query = """
        SELECT ts as timestamp, humidity, pressure, rain_1h, clouds as cloudiness
        FROM weather_api 
        ORDER BY ts DESC 
        LIMIT 1
    """
    data = Database.execute_query(query, fetch_all=False)
    
    if not data:
        raise HTTPException(status_code=404, detail="No weather data found")
    
    return data