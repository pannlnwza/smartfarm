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
  
  // Dashboard data structure
  export interface DashboardData {
    latestSensor: SensorData | null;
    sensorHistory: SensorData[];
    weather: WeatherData | null;
    sun: SunData | null;
    loading: boolean;
    error: string | null;
  }