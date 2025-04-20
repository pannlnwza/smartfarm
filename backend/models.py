from datetime import datetime
from pydantic import BaseModel

class SensorData(BaseModel):
    id: int
    timestamp: datetime
    lux: float
    temperature: float
    soil_moisture: float

class WeatherData(BaseModel):
    timestamp: datetime
    humidity: float
    pressure: float
    rain_1h: float
    cloudiness: int

class SunData(BaseModel):
    timestamp: datetime
    sunrise: str
    sunset: str
    solar_noon: str
    day_length: str

class HealthPredictionInput(BaseModel):
    temperature: float
    sensor_id: int
    soil_moisture: float
    light_intensity: float
    humidity: float
    save_to_history: bool = True

class HealthScore(BaseModel):
    timestamp: datetime
    health_status: str