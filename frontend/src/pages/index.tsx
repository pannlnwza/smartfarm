// src/pages/dashboard.tsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSensorData, fetchWeatherData, fetchWeatherHistory, fetchSunData, fetchSunHistory, calculatePlantHealthIndex, fetchHealthHistory } from '@/lib/api-client';
import { DashboardData, SensorData, WeatherData } from '@/models/dashboard';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// Determine alerts based on sensor and weather data
function generateAlerts(data: DashboardData) {
  const alerts = [];
  
  if (data.latestSensor?.soil_moisture && data.latestSensor.soil_moisture < 30) {
    alerts.push({
      type: 'critical',
      message: 'CRITICAL: Soil moisture extremely low! Water plants immediately!'
    });
  }
  
  if (data.latestSensor?.temperature && data.latestSensor.temperature > 35) {
    alerts.push({
      type: 'warning',
      message: 'Warning: High temperature may stress plants. Consider providing shade.'
    });
  }
  
  if (data.weather?.rain_1h && data.weather.rain_1h > 10) {
    alerts.push({
      type: 'warning',
      message: 'Warning: Heavy rainfall detected. Check for flooding or drainage issues.'
    });
  }
  
  return alerts;
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format time for chart display
function formatTimeForChart(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    latestSensor: null,
    sensorHistory: [],
    weather: null,
    weatherHistory: [],
    sun: null,
    sunHistory: [],
    healthHistory: [],
    loading: true,
    error: null
  });
  
  const [refreshInterval, setRefreshInterval] = useState<number>(60000); // 1 minute
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [plantHealth, setPlantHealth] = useState<{ health_score: number; health_status: string }>({
    health_score: 0,
    health_status: 'UNKNOWN'
  });
  
  const [timeRange, setTimeRange]  = useState<string>('24h');

  // Fetch data from API
  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch sensor data
      const sensorData = await fetchSensorData();
      
      // Fetch weather data
      const weatherData = await fetchWeatherData();
      const weatherHistory = await fetchWeatherHistory();
      
      // Fetch sun data
      const sunData = await fetchSunData();
      const sunHistory = await fetchSunHistory();

      const plantHealth = await calculatePlantHealthIndex(sensorData[0], weatherData);
      const healthHistory = await fetchHealthHistory();
      setPlantHealth(plantHealth);

      
      setDashboardData({
        latestSensor: sensorData[0] || null,
        sensorHistory: sensorData,
        weather: weatherData,
        weatherHistory: weatherHistory,
        sun: sunData,
        sunHistory: sunHistory,
        healthHistory: healthHistory,
        loading: false,
        error: null
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "An unknown error occurred"
      }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Set up periodic refresh
  useEffect(() => {
    const intervalId = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  useEffect(() => {
    const intervalId = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Filter data based on selected time range
  const filterDataByTimeRange = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const now = new Date().getTime();
    const rangeInHours = timeRange === "24h" ? 24 : 
                        timeRange === "12h" ? 12 : 
                        timeRange === "6h" ? 6 : 3;
    
    const cutoffTime = now - (rangeInHours * 60 * 60 * 1000);
    
    return data.filter(item => new Date(item.timestamp).getTime() > cutoffTime);
  };

  const weatherMap = new Map(
    filterDataByTimeRange(dashboardData.weatherHistory).map(reading => [
      formatTimeForChart(reading.timestamp),
      reading.rain_1h
    ])
  );
  
  const moistureRainChartData = filterDataByTimeRange(dashboardData.sensorHistory).map(reading => {
    const name = formatTimeForChart(reading.timestamp);
    return {
      name: name,
      moisture: reading.soil_moisture,
      rain: weatherMap.get(name) ?? 0
    };
  });

  const humidityMap = new Map(
    filterDataByTimeRange(dashboardData.weatherHistory).map(reading => [
      formatTimeForChart(reading.timestamp),
      reading.humidity
    ])
  );

  const tempHumidityChartData = filterDataByTimeRange(dashboardData.sensorHistory).map(reading => {
    const name = formatTimeForChart(reading.timestamp);
    return {
      name: name,
      temperature: reading.temperature,
      humidity: humidityMap.get(name) ?? null
    };
  });


  const sensorChartData = filterDataByTimeRange(dashboardData.sensorHistory).map(reading => ({
    name: formatTimeForChart(reading.timestamp),
    temperature: reading.temperature,
    moisture: reading.soil_moisture,
    lux: reading.lux
  }));
  
  const weatherChartData = filterDataByTimeRange(dashboardData.weatherHistory).map(reading => ({
    name: formatTimeForChart(reading.timestamp),
    humidity: reading.humidity,
    pressure: reading.pressure / 10, // Scale down for better visualization
    rain: reading.rain_1h,
    cloudiness: reading.cloudiness
  }));
  
  const healthChartData = filterDataByTimeRange(dashboardData.healthHistory).map(reading => ({
    name: formatTimeForChart(reading.timestamp),
    score: reading.health_score,
    status: reading.health_status
  }));

  const sunChartData = filterDataByTimeRange(dashboardData.sunHistory).map(reading => ({
    name: formatTimeForChart(reading.timestamp),
    sunrise: reading.sunrise,
    sunset: reading.sunset,
    solar_noon: reading.solar_noon,
    day_length: reading.day_length
  }));

  // Calculate plant health
  
  // Generate alerts
  const alerts = generateAlerts(dashboardData);
  
  // Loading state
  if (dashboardData.loading && !dashboardData.latestSensor) {
    return (
      <div className={`${geistSans.className} ${geistMono.className} bg-gray-900 text-gray-100 p-6 w-full h-screen flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-xl mb-4">Loading dashboard data...</h2>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (dashboardData.error && !dashboardData.latestSensor) {
    return (
      <div className={`${geistSans.className} ${geistMono.className} bg-gray-900 text-gray-100 p-6 w-full h-screen flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-xl mb-4 text-red-500">Error Loading Dashboard</h2>
          <p className="mb-4">{dashboardData.error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.className} ${geistMono.className} bg-gray-900 text-gray-100 p-6 w-full min-h-screen`}>
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-700">
        <h1 className="text-2xl font-semibold">SmartFarm Dashboard</h1>
        <div className="flex items-center">
          <div className="mr-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option value="3h">Last 3 Hours</option>
              <option value="6h">Last 6 Hours</option>
              <option value="12h">Last 12 Hours</option>
              <option value="24h">Last 24 Hours</option>
            </select>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="mr-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
          <span className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Plant Health Index Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-medium">Plant Health Index</h2>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{plantHealth.health_score}</div>
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold text-white ${
              plantHealth.health_status === 'Excellent' ? 'bg-green-500' :
              plantHealth.health_status === 'Healthy' ? 'bg-lime-500' :
              plantHealth.health_status === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {plantHealth.health_status}
            </div>
          </div>
          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#10b981" dot={{ r: 3 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Soil & Water Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-medium">Soil & Rain</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Soil Moisture</div>
              <div className="text-xl font-bold">
                {dashboardData.latestSensor?.soil_moisture || 0}%
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Rainfall (1h)</div>
              <div className="text-xl font-bold">
                {dashboardData.weather?.rain_1h || 0}mm
              </div>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moistureRainChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="moisture" stroke="#22c55e" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="rain" stroke="#3b82f6" dot={false} strokeWidth={2} strokeDasharray={"3 3"} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature & Humidity Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-medium">Temperature & Humidity</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Temperature</div>
              <div className="text-xl font-bold">
                {dashboardData.latestSensor?.temperature || 0}°C
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Humidity</div>
              <div className="text-xl font-bold">
                {dashboardData.weather?.humidity || 0}%
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Pressure</div>
              <div className="text-xl font-bold">
                {dashboardData.weather?.pressure || 0}
              </div>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempHumidityChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="temperature" stroke="#ef4444" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="humidity" stroke="#38bdf8" dot={false} strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Light Conditions Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-medium">Light Conditions</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Light Intensity</div>
              <div className="text-xl font-bold">
                {dashboardData.latestSensor?.lux || 0} lux
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Cloudiness</div>
              <div className="text-xl font-bold">
                {dashboardData.weather?.cloudiness || 0}%
              </div>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="lux" stroke="#eab308" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day Timeline Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-medium">Day Timeline</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Sunrise</div>
              <div className="text-xl font-bold">{dashboardData.sun?.sunrise || "--:--"}</div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Sunset</div>
              <div className="text-xl font-bold">{dashboardData.sun?.sunset || "--:--"}</div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Day Length</div>
              <div className="text-xl font-bold">{dashboardData.sun?.day_length || "--:--"}</div>
            </div>
          </div>
          <div className="h-12 w-full mt-4 relative bg-gray-700 rounded-lg overflow-hidden">
            {/* Night time (before sunrise) */}
            <div className="absolute top-0 left-0 h-full w-1/4 bg-blue-900 bg-opacity-30"></div>
            {/* Day time */}
            <div className="absolute top-0 left-1/4 h-full w-1/2 bg-yellow-500 bg-opacity-20"></div>
            {/* Night time (after sunset) */}
            <div className="absolute top-0 right-0 h-full w-1/4 bg-blue-900 bg-opacity-30"></div>
            {/* Markers */}
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-orange-500 rounded-full transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-500 rounded-full transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-red-500 rounded-full transform -translate-y-1/2"></div>
            {/* Current time indicator */}
            <div className="absolute top-1/2 left-3/5 w-4 h-4 bg-white border-2 border-black rounded-full transform -translate-y-1/2"></div>
          </div>
        </div>

        {/* Moisture Time Series Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-medium">Soil Moisture History</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sunChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="moisture" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {dashboardData.latestSensor?.soil_moisture && dashboardData.latestSensor.soil_moisture < 30 && (
            <div className="mt-2 text-center text-sm text-yellow-500 font-medium">
              Soil moisture is below optimal levels
            </div>
          )}
        </div>

        {/* Alerts Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <div className="flex items-center">
              <h2 className="text-lg font-medium">Alerts & Notifications</h2>
              {alerts.length > 0 && (
                <div className="ml-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {alerts.length}
                </div>
              )}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded ${
                    alert.type === 'critical' 
                      ? 'bg-red-900 bg-opacity-20 border-l-4 border-red-500' 
                      : 'bg-yellow-900 bg-opacity-20 border-l-4 border-yellow-500'
                  }`}
                >
                  <p className={`font-medium ${
                    alert.type === 'critical' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-3 rounded bg-green-900 bg-opacity-20 border-l-4 border-green-500">
                <p className="font-medium text-green-400">
                  No alerts at this time. All systems normal.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}