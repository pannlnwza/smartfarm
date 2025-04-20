export interface SensorData {
    id: number;
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

  export interface TimeUntilRain {
    days: number;
    hours: number;
  }
  
  export interface Forecast {
    datetime_local: string;   // e.g., "2025-04-21 14:00:00"
    timestamp: number;        // UNIX timestamp or epoch time
    rain_mm: number;          // Rain volume in mm over 3 hours
    temperature: number;      // Temperature in Celsius
    weather: string;          // Main weather condition, e.g., "Rain"
    description: string;      // Detailed description, e.g., "light rain"
  }
  
  export interface ForecastSummary {
    message: string;              // Human-readable message about rain timing
    time_until_rain: TimeUntilRain;
  }
  
  export interface Forecasts {
    status: string;               // e.g., "rain_expected" or "clear"
    summary: ForecastSummary;
    forecast: Forecast;
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
    forecast: Forecasts[];
    loading: boolean;
    error: string | null;
  }


