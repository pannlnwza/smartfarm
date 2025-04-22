import {useEffect, useMemo, useState} from 'react';
import {Geist, Geist_Mono} from "next/font/google";
import Link from 'next/link';
import {
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  fetchAllSensorData,
  fetchAllWeather,
  fetchHealthHistory,
  fetchSensorData,
  fetchSunHistory,
  fetchWeatherHistory
} from '@/lib/api-client';
import {HealthScore, SensorData, SunData, WeatherData} from '@/models/dashboard';
import CorrelationMatrix from '@/components/CorrelationMatrix';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
// Health status colors
const HEALTH_COLORS = {
    'Healthy': '#4caf50',
    'Moderate Stress': '#ffeb3b',
    'High Stress': '#f44336',
    'UNKNOWN': '#9e9e9e'
};

export default function StatisticsPage() {
    const [sensorData, setSensorData] = useState<SensorData[]>([]);
    const [sensorAllData, setSensorAll] = useState<SensorData[]>([]);
    const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
    const [weatherAllData, setWeatherAll] = useState<WeatherData[]>([]);
    const [sunData, setSunData] = useState<SunData[]>([]);
    const [healthData, setHealthData] = useState<HealthScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [sensors, sensorAll, weather, weatherAll, sun, health] = await Promise.all([
                    fetchSensorData(),
                    fetchAllSensorData(),
                    fetchWeatherHistory(),
                    fetchAllWeather(),

                    fetchSunHistory(),
                    fetchHealthHistory()
                ]);

                setSensorData(sensors);
                setSensorAll(sensorAll);
                setWeatherData(weather);
                setWeatherAll(weatherAll);
                setSunData(sun);
                setHealthData(health);
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Process data for health status distribution
    const processHealthData = () => {
        if (!healthData.length) return [];

        const statusCount: Record<string, number> = {};
        healthData.forEach(entry => {
            const status = entry.health_status || 'UNKNOWN';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });

        return Object.keys(statusCount).map(status => ({
            name: status,
            value: statusCount[status]
        }));
    };


    // Process weather and sun data correlation
    const processCorrelationData = () => {
        if (!sensorData.length || !weatherData.length) return [];

        const correlationPoints = [];
        const weatherTimestamps = weatherData.map(w => new Date(w.timestamp).getTime());

        for (const sensor of sensorData.slice(0, 10)) { // Limit to 10 points for clarity
            const sensorTime = new Date(sensor.timestamp).getTime();

            // Find closest weather reading
            const closestWeatherIndex = weatherTimestamps.reduce((closest, time, index) => {
                const current = Math.abs(time - sensorTime);
                const previous = Math.abs(weatherTimestamps[closest] - sensorTime);
                return current < previous ? index : closest;
            }, 0);

            const matchedWeather = weatherData[closestWeatherIndex];

            // Only add if we have a reading within a reasonable timeframe
            if (Math.abs(weatherTimestamps[closestWeatherIndex] - sensorTime) < 3600000) {
                correlationPoints.push({
                    timestamp: new Date(sensor.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                    temperature: sensor.temperature,
                    soil_moisture: sensor.soil_moisture,
                    humidity: matchedWeather.humidity,
                    rain: matchedWeather.rain_1h * 10 // Scale up for visibility
                });
            }
        }

        return correlationPoints;
    };


    const comparisonOptions = [
        {label: "Temperature", key: "temperature", source: "sensor"},
        {label: "Humidity", key: "humidity", source: "weather"},
        {label: "Rainfall", key: "rain_1h", source: "weather"},
        {label: "Light Intensity", key: "lux", source: "sensor"}
    ];

    const [selectedComparison, setSelectedComparison] = useState(comparisonOptions[0]);

    const mergedData = useMemo(() => {
        return sensorAllData
            .map(sensor => {
                const closestWeather = weatherAllData.reduce((closest, current) => {
                    const sensorTime = new Date(sensor.timestamp).getTime();
                    const currentTime = new Date(current.timestamp).getTime();
                    const closestTime = new Date(closest.timestamp).getTime();

                    return Math.abs(sensorTime - currentTime) < Math.abs(sensorTime - closestTime)
                        ? current
                        : closest;
                });

                const timeDiff = Math.abs(new Date(sensor.timestamp).getTime() - new Date(closestWeather.timestamp).getTime()) / 60000;
                if (timeDiff > 10) return null;

                return {
                    timestamp: sensor.timestamp,
                    soil_moisture: sensor.soil_moisture,
                    temperature: sensor.temperature,
                    lux: sensor.lux,
                    humidity: closestWeather.humidity,
                    rain_1h: closestWeather.rain_1h,
                };
            })
            .filter((item): item is any => item !== null);
    }, [sensorData, weatherData]);

    const getTrendLine = (data: any[], xKey: string, yKey: string) => {
        const n = data.length;
        if (n === 0) return [];

        const sumX = data.reduce((acc, d) => acc + d[xKey], 0);
        const sumY = data.reduce((acc, d) => acc + d[yKey], 0);
        const sumXY = data.reduce((acc, d) => acc + d[xKey] * d[yKey], 0);
        const sumX2 = data.reduce((acc, d) => acc + d[xKey] ** 2, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
        const intercept = (sumY - slope * sumX) / n;

        const minX = Math.min(...data.map(d => d[xKey]));
        const maxX = Math.max(...data.map(d => d[xKey]));

        return [
            {[xKey]: minX, [yKey]: slope * minX + intercept},
            {[xKey]: maxX, [yKey]: slope * maxX + intercept},
        ];
    };

    const healthDistribution = processHealthData();
    const correlationData = processCorrelationData();

    


    return (
        <div className={`${geistSans.className} ${geistMono.className} bg-white text-gray-800 min-h-screen`}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-black">SmartFarm Statistics</h1>
                    <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="mr-2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div
                        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                ) : error ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Main Content */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <StatCard
                                title="Avg. Temperature"
                                value={`${(sensorData.reduce((sum, item) => sum + item.temperature, 0) / sensorData.length).toFixed(1)}°C`}
                                description="Last 24 hours"
                                icon="🌡️"
                            />
                            <StatCard
                                title="Avg. Soil Moisture"
                                value={`${(sensorData.reduce((sum, item) => sum + item.soil_moisture, 0) / sensorData.length).toFixed(1)}%`}
                                description="Last 24 hours"
                                icon="💧"
                            />
                            <StatCard
                                title="Avg. Light Intensity"
                                value={`${(sensorData.reduce((sum, item) => sum + item.lux, 0) / sensorData.length).toFixed(0)} lux`}
                                description="Last 24 hours"
                                icon="☀️"
                            />
                            <StatCard
                                title="Rain Total"
                                value={`${weatherData.reduce((sum, item) => sum + item.rain_1h, 0).toFixed(1)} mm`}
                                description="Last 24 hours"
                                icon="🌧️"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                            {/* Sensor Data Trends */}
                            <div className="lg:col-span-2">
                                <div className="bg-white shadow-sm rounded-lg p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Soil Moisture
                                        vs {selectedComparison.label}</h2>

                                    <select
                                        className="mb-4 border p-2 rounded"
                                        value={selectedComparison.key}
                                        onChange={e => {
                                            const option = comparisonOptions.find(opt => opt.key === e.target.value);
                                            if (option) setSelectedComparison(option);
                                        }}
                                    >
                                        {comparisonOptions.map(opt => (
                                            <option key={opt.key} value={opt.key}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="w-full h-[400px]">

                                        <ResponsiveContainer>
                                            <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                                                <CartesianGrid/>
                                                <XAxis
                                                    type="number"
                                                    dataKey={selectedComparison.key}
                                                    name={selectedComparison.label}
                                                    unit={selectedComparison.key === "lux" ? "lx" : selectedComparison.key === "rain_1h" ? "mm" : selectedComparison.key === "temperature" ? "°C" : "%"}
                                                />
                                                <YAxis type="number" dataKey="soil_moisture" name="Soil Moisture (%)"
                                                       unit="%"/>
                                                <Tooltip cursor={{strokeDasharray: '3 3'}}/>
                                                <Scatter name="Soil Data" data={mergedData} fill="#8884d8"/>
                                                <Scatter
                                                    name="Trend Line"
                                                    data={getTrendLine(mergedData, selectedComparison.key, "soil_moisture")}
                                                    line
                                                    strokeWidth={2}
                                                    fill="red"
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 text-sm text-gray-600">
                                        {selectedComparison.key === "temperature" && (
                                            <p>
                                                Higher temperatures typically increase evaporation rates, which can
                                                reduce soil moisture.
                                            </p>
                                        )}
                                        {selectedComparison.key === "lux" && (
                                            <p>
                                                Light intensity (lux) affects plant transpiration. More light may lead
                                                to faster drying of soil.
                                            </p>
                                        )}
                                        {selectedComparison.key === "rain_1h" && (
                                            <p>
                                                Rainfall directly adds water to the soil, often increasing soil moisture
                                                significantly.
                                            </p>
                                        )}
                                        {selectedComparison.key === "humidity" && (
                                            <p>
                                                Higher humidity can slow down evaporation, helping retain soil moisture
                                                for longer periods.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Health Status Distribution */}
                            <div className="lg:col-span-1">
                                <div className="bg-white shadow-sm rounded-lg p-6">
                                    <h2 className="text-xl font-semibold mb-6 text-gray-700">Plant Health
                                        Distribution</h2>
                                    <ResponsiveContainer width="100%" height={485}>
                                        <PieChart>
                                            <Pie
                                                data={healthDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="name"
                                                label={false}
                                            >
                                                {healthDistribution.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={HEALTH_COLORS[entry.name as keyof typeof HEALTH_COLORS] || '#9e9e9e'}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{fontSize: '12px', fontWeight: 'normal'}}
                                                formatter={(value, name, props) => {
                                                    const total = healthDistribution.reduce((sum, entry) => sum + entry.value, 0);
                                                    const percent = ((value / total) * 100).toFixed(0);
                                                    return [`${name}: ${percent}%`, 'Percentage'];
                                                }}
                                            />
                                            <Legend layout="horizontal" verticalAlign="bottom" align="center"/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <div className="lg:col-span-3">
                                <CorrelationMatrix/>
                            </div>
                        </div>


                    </>
                )}
            </div>
        </div>
    );
}

function StatCard({title, value, description, icon}: {
    title: string,
    value: string,
    description: string,
    icon: string
}) {
    return (
        <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-xl font-bold font-mono">{value}</p>
                    <p className="text-xs text-gray-400">{description}</p>
                </div>
                <div className="text-2xl">{icon}</div>
            </div>
        </div>
    );
}