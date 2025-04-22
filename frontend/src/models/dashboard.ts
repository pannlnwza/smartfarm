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
    status: string;
}

export interface TimeUntilRain {
    days: number;
    hours: number;
}

export interface Forecast {
    datetime_local: string;
    timestamp: number;
    rain_mm: number;
    temperature: number;
    weather: string;
    description: string;
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

export interface HourlyAverage {
    hour: string;
    temperature: number;
    moisture: number;
    light: number;
}

export interface CorrelationPoint {
    timestamp: string;
    temperature: number;
    moisture: number;
    humidity: number;
    rain: number;
}

export interface HealthDistribution {
    name: string;
    value: number;
}

