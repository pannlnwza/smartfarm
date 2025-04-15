import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

// Mock data for visualization
const mockData = {
  current: {
    lux: 15200,
    temperature: 26.5,
    soil_moisture: 28,
    humidity: 65,
    pressure: 1013,
    rain_1h: 0,
    cloudiness: 25
  },
  dayInfo: {
    sunrise: '06:15',
    sunset: '19:45',
    solar_noon: '13:00',
    day_length: '13:30'
  },
  history: {
    timestamps: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
    temperature: [21.2, 22.5, 24.1, 25.3, 26.2, 26.5, 26.3],
    soil_moisture: [45, 42, 38, 35, 31, 29, 28],
    lux: [5200, 8600, 12400, 14300, 15000, 15200, 14800],
    humidity: [72, 70, 68, 66, 65, 65, 65]
  }
};

// Format data for charts
const chartData = mockData.history.timestamps.map((time, index) => ({
  name: time,
  temperature: mockData.history.temperature[index],
  moisture: mockData.history.soil_moisture[index],
  lux: mockData.history.lux[index],
  humidity: mockData.history.humidity[index]
}));

// Alert examples
const alerts = [
  {
    type: 'critical',
    message: 'CRITICAL: Soil moisture extremely low! Water plants immediately!'
  },
  {
    type: 'warning',
    message: 'Warning: High temperature may stress plants. Consider providing shade.'
  }
];

export default function Dashboard() {
  return (
    <div className="bg-gray-900 text-gray-100 p-6 w-full">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-700">
        <h1 className="text-2xl font-semibold">SmartFarm</h1>
        <span className="text-sm text-gray-400">
          Last updated: Apr 13, 2025, 2:35 PM
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Plant Health Index Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-medium">Plant Health Index</h2>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">7.2</div>
            <div className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-white bg-lime-500">
              GOOD
            </div>
          </div>
        </div>

        {/* Soil & Water Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-medium">Soil & Water</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Soil Moisture</div>
              <div className="text-xl font-bold">
                28%
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Rainfall (1h)</div>
              <div className="text-xl font-bold">
                0mm
              </div>
            </div>
          </div>
          <div className="h-48 w-full">
            <LineChart width={300} height={180} data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="moisture" stroke="#3b82f6" dot={false} strokeWidth={2} />
            </LineChart>
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
                26.5°C
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Humidity</div>
              <div className="text-xl font-bold">
                65%
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Pressure</div>
              <div className="text-xl font-bold">
                1013
              </div>
            </div>
          </div>
          <div className="h-48 w-full">
            <LineChart width={300} height={180} data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="humidity" stroke="#38bdf8" dot={false} strokeWidth={2} strokeDasharray="3 3" />
            </LineChart>
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
                15200 lux
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Cloudiness</div>
              <div className="text-xl font-bold">
                25%
              </div>
            </div>
          </div>
          <div className="h-48 w-full">
            <LineChart width={300} height={180} data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="lux" stroke="#eab308" dot={false} strokeWidth={2} />
            </LineChart>
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
              <div className="text-xl font-bold">06:15</div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Sunset</div>
              <div className="text-xl font-bold">19:45</div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Day Length</div>
              <div className="text-xl font-bold">13:30</div>
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
            <LineChart width={300} height={200} data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="moisture" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            </LineChart>
          </div>
          <div className="mt-2 text-center text-sm text-yellow-500 font-medium">
            Soil moisture is below optimal levels
          </div>
        </div>

        {/* Alerts Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <div className="flex items-center">
              <h2 className="text-lg font-medium">Alerts & Notifications</h2>
              <div className="ml-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                2
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 rounded bg-red-900 bg-opacity-20 border-l-4 border-red-500">
              <p className="font-medium text-red-400">
                CRITICAL: Soil moisture extremely low! Water plants immediately!
              </p>
            </div>
            <div className="p-3 rounded bg-yellow-900 bg-opacity-20 border-l-4 border-yellow-500">
              <p className="font-medium text-yellow-400">
                Warning: High temperature may stress plants. Consider providing shade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}