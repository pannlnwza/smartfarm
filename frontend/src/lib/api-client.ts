import { SensorData, WeatherData, SunData } from "@/models/dashboard";

const API_BASE_URL = "http://localhost:8000/api";

export async function fetchSensorData(): Promise<SensorData[]> {
  const response = await fetch(`${API_BASE_URL}/sensor-data`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sensor data: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchWeatherData(): Promise<WeatherData> {
  const response = await fetch(`${API_BASE_URL}/weather-data`);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchSunData(): Promise<SunData> {
  const response = await fetch(`${API_BASE_URL}/sun-data`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sun data: ${response.statusText}`);
  }
  return await response.json();
}

export async function calculatePlantHealthIndex(sensorData: SensorData | null, weatherData: WeatherData | null) {
    if (!sensorData) return { score: 0, status: 'UNKNOWN' };
  
    const humidity = weatherData ? weatherData.humidity : null;
    console.log("Sensor Data:", sensorData);
    console.log("Humidity:", humidity);
  
    const response = await fetch(`${API_BASE_URL}/predict-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temperature: sensorData.temperature,
        soil_moisture: sensorData.soil_moisture,
        humidity: humidity,
        light_intensity: sensorData.lux
      })
    });
  
    return await response.json();
  }