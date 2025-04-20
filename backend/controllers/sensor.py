from fastapi import APIRouter, HTTPException
from typing import List
from ..models import SensorData
from ..database import Database
from datetime import datetime
import numpy as np

router = APIRouter()

@router.get("/sensor-data", response_model=List[SensorData])
async def get_all_sensor_data():
    query = """
        SELECT id, ts as timestamp, lux, temperature, moisture as soil_moisture
        FROM smartfarm 
        ORDER BY ts ASC
    """
    return Database.execute_query(query)


@router.get("/sensor-data/recent", response_model=List[SensorData])
async def get_sensor_data():
    query = """
        SELECT id, ts as timestamp, lux, temperature, moisture as soil_moisture
        FROM smartfarm 
        WHERE ts > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY ts ASC
    """
    return Database.execute_query(query)

@router.get("/correlation-matrix")
async def get_correlation_matrix():
    query = """
        SELECT
            s.moisture AS soil_moisture,
            s.temperature,
            s.lux,
            w.rain_1h,
            w.humidity,
            sun.sunrise,
            sun.sunset,
            s.ts AS sensor_ts
        FROM smartfarm s
        JOIN weather_api w ON ABS(TIMESTAMPDIFF(MINUTE, s.ts, w.ts)) <= 10
        JOIN sunrise_sunset sun ON DATE(s.ts) = DATE(sun.ts)
    """

    rows = Database.execute_query(query)

    if not rows:
        raise HTTPException(status_code=404, detail="No data found")

    keys = ["soil_moisture", "temperature", "rain_1h", "humidity", "lux", "daylight_minutes"]
    data_matrix = []

    for row in rows:
        try:
            # Ensure correct column names
            soil_moisture = row.get("soil_moisture")
            temperature = row.get("temperature")
            lux = row.get("lux")
            rain_1h = row.get("rain_1h")
            humidity = row.get("humidity")
            sunrise_str = row.get("sunrise")
            sunset_str = row.get("sunset")
            sensor_ts = row.get("sensor_ts")  # Sensor timestamp for the date

            # Check if sunrise and sunset are present
            if sunrise_str and sunset_str:
                # Get the date from sensor_ts
                if isinstance(sensor_ts, str):
                    sensor_date = datetime.strptime(sensor_ts, "%Y-%m-%d %H:%M:%S").date()
                else:  # Assume it's already a datetime
                    sensor_date = sensor_ts.date()

                # Process sunrise
                if isinstance(sunrise_str, str):
                    try:
                        # Try parsing as time only
                        sunrise_time = datetime.strptime(sunrise_str, "%H:%M:%S").time()
                        sunrise = datetime.combine(sensor_date, sunrise_time)
                    except ValueError:
                        # Try parsing as full datetime
                        sunrise = datetime.strptime(sunrise_str, "%Y-%m-%d %H:%M:%S")
                else:  # Already a datetime
                    sunrise = sunrise_str

                # Process sunset
                if isinstance(sunset_str, str):
                    try:
                        # Try parsing as time only
                        sunset_time = datetime.strptime(sunset_str, "%H:%M:%S").time()
                        sunset = datetime.combine(sensor_date, sunset_time)
                    except ValueError:
                        # Try parsing as full datetime
                        sunset = datetime.strptime(sunset_str, "%Y-%m-%d %H:%M:%S")
                else:  # Already a datetime
                    sunset = sunset_str
                    
                # Calculate daylight minutes
                daylight_minutes = (sunset - sunrise).total_seconds() / 60.0

            # Skip row if any required value is missing
            if None in (soil_moisture, temperature, lux, rain_1h, humidity, daylight_minutes):
                continue

            data_matrix.append([
                soil_moisture,
                temperature,
                rain_1h,
                humidity,
                lux,
                daylight_minutes
            ])
        except Exception as e:
            print(f"Error processing row: {e}")
            continue

    if len(data_matrix) < 2:
        raise HTTPException(status_code=400, detail="Not enough data for correlation")

    np_data = np.array(data_matrix)
    corr_matrix = np.corrcoef(np_data, rowvar=False)

    result = {k1: {k2: round(corr_matrix[i][j], 2) for j, k2 in enumerate(keys)} for i, k1 in enumerate(keys)}

    return result