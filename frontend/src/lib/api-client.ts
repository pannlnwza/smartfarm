import { SensorData, WeatherData, SunData, HealthScore, Forecasts } from "@/models/dashboard";

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

  export async function fetchWeatherHistory(): Promise<WeatherData[]> {
    const response = await fetch(`${API_BASE_URL}/weather-history`);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather history: ${response.statusText}`);
    }
    return await response.json();
  }
  
  export async function fetchSunHistory(): Promise<SunData[]> {
    const response = await fetch(`${API_BASE_URL}/sun-history`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sun history: ${response.statusText}`);
    }
    return await response.json();
  }
  
  export async function fetchHealthHistory(): Promise<HealthScore[]> {
    const response = await fetch(`${API_BASE_URL}/health-history`);
    if (!response.ok) {
      throw new Error(`Failed to fetch health history: ${response.statusText}`);
    }
    return await response.json();
  }

  export async function fetchForecast(): Promise<Forecasts> {
    const response = await fetch(`${API_BASE_URL}/when-will-it-rain`);
    if (!response.ok) {
      throw new Error(`Failed to fetch forecast: ${response.statusText}`);
    }
    console.log("Forecast Response:", response);
    return await response.json();
  }