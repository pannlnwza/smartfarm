from fastapi import APIRouter, HTTPException
from typing import List
from ..models import SunData
from ..database import Database

router = APIRouter()

def format_timedelta(td):
    """Convert timedelta to HH:MM:SS format"""
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

@router.get("/sun-data", response_model=SunData)
async def get_sun_data():
    query = """
        SELECT ts as timestamp, sunrise, sunset, solar_noon, day_length 
        FROM sunrise_sunset 
        ORDER BY ts DESC 
        LIMIT 1
    """
    data = Database.execute_query(query, fetch_all=False)
    
    if not data:
        raise HTTPException(status_code=404, detail="No sun data found")
    
    # Format timedelta objects to strings
    formatted_data = {
        "timestamp": data["timestamp"],
        "sunrise": format_timedelta(data["sunrise"]),
        "sunset": format_timedelta(data["sunset"]),
        "solar_noon": format_timedelta(data["solar_noon"]),
        "day_length": format_timedelta(data["day_length"])
    }
    
    return formatted_data

@router.get("/sun-data/recent", response_model=List[SunData])
async def get_sun_history():
    query = """
        SELECT ts as timestamp, sunrise, sunset, solar_noon, day_length 
        FROM sunrise_sunset 
        WHERE ts > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY ts ASC
    """
    data = Database.execute_query(query)
    
    if not data:
        raise HTTPException(status_code=404, detail="No sun history found")
    
    # Format timedelta objects to strings for each record
    formatted_data = []
    for item in data:
        formatted_data.append({
            "timestamp": item["timestamp"],
            "sunrise": format_timedelta(item["sunrise"]),
            "sunset": format_timedelta(item["sunset"]),
            "solar_noon": format_timedelta(item["solar_noon"]),
            "day_length": format_timedelta(item["day_length"])
        })
    
    return formatted_data