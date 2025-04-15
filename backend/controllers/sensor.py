from fastapi import APIRouter
from typing import List
from ..models import SensorData
from ..database import Database

router = APIRouter()

@router.get("/sensor-data", response_model=List[SensorData])
async def get_sensor_data():
    query = """
        SELECT ts as timestamp, lux, temperature, moisture as soil_moisture
        FROM smartfarm 
        ORDER BY ts DESC 
        LIMIT 100
    """
    return Database.execute_query(query)