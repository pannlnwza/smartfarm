from datetime import datetime
from pydantic import BaseModel

class SensorData(BaseModel):
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