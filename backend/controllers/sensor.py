from fastapi import APIRouter
from typing import List
from ..models import SensorData
from ..database import Database

router = APIRouter()

@router.get("/sensor-data", response_model=List[SensorData])
async def get_sensor_data():
    query = """
        SELECT id, ts as timestamp, lux, temperature, moisture as soil_moisture
        FROM smartfarm 
        WHERE ts > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY ts ASC
    """
    return Database.execute_query(query)
