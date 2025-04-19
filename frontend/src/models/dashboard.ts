export interface SensorData {
    timestamp: string;
    lux: number;
    temperature: number;
    soil_moisture: number;
  }
  
  export interface WeatherData {
    timestamp: string;
    humidity: number;
    pressure: number;
    rain_1h: number;
    cloudiness: number;
  }
  
  export interface SunData {
    timestamp: string;
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: string;
  }

  export interface HealthScore {
    timestamp: string;
    score: number;
    status: string;
  }
  
  // Dashboard data structure
  export interface DashboardData {
    latestSensor: SensorData | null;
    sensorHistory: SensorData[];
    weather: WeatherData | null;
    weatherHistory: WeatherData[];
    sun: SunData | null;
    sunHistory: SunData[];
    healthHistory: HealthScore[];
    loading: boolean;
    error: string | null;
  }

