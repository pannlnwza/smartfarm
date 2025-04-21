import { SensorData, WeatherData, SunData, HealthScore, Forecasts } from "@/models/dashboard";

const API_BASE_URL = "http://localhost:8000/api";

export async function fetchSensorData(): Promise<SensorData[]> {
  const response = await fetch(`${API_BASE_URL}/sensor-data/recent`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sensor data: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchAllSensorData(): Promise<SensorData[]> {
  const response = await fetch(`${API_BASE_URL}/sensor-data`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sensor data: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchWeatherData(): Promise<WeatherData> {
  const response = await fetch(`${API_BASE_URL}/weather-data/latest`);
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
        sensor_id: sensorData.id,
        temperature: sensorData.temperature,
        soil_moisture: sensorData.soil_moisture,
        humidity: humidity,
        light_intensity: sensorData.lux
      })
    });
  
    return await response.json();
  }

  export async function fetchWeatherHistory(): Promise<WeatherData[]> {
    const response = await fetch(`${API_BASE_URL}/weather-data/recent`);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather history: ${response.statusText}`);
    }
    return await response.json();
  }

  export async function fetchAllWeather(): Promise<WeatherData[]> {
    const response = await fetch(`${API_BASE_URL}/weather-data`);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather history: ${response.statusText}`);
    }
    return await response.json();
  }
  
  export async function fetchSunHistory(): Promise<SunData[]> {
    const response = await fetch(`${API_BASE_URL}/sun-data/latest`);
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


  export async function fetchCorrelation() {
    const response = await fetch(`${API_BASE_URL}/correlation-matrix`);
    if (!response.ok) {
      throw new Error(`Failed to fetch correlation matrix: ${response.statusText}`);
    }
    console.log("Correlation Response:", response);
    return await response.json();
  }

  export async function fetchWaterRecommendation(sensorData: SensorData | null, rainDatetime: string | null) {
    if (!sensorData) return { message: 'No recommendation available' };
  
    const response = await fetch(`${API_BASE_URL}/watering-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temperature: sensorData.temperature,
        moisture: sensorData.soil_moisture,
        lux: sensorData.lux,
        datetime_local: rainDatetime
      })
    });
  
    return await response.json();
  }