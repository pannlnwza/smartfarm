import { fetchCorrelation } from '@/lib/api-client';
import { useState, useEffect } from 'react';

// Define types for the correlation data
interface CorrelationValue {
  [key: string]: number;
}

interface CorrelationMatrix {
  [key: string]: CorrelationValue;
}

export default function CorrelationMatrix() {
  const [correlationData, setCorrelationData] = useState<CorrelationMatrix | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCorrelationData = async () => {
      try {
        const data = await fetchCorrelation(); // Use your existing function
        setCorrelationData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching correlation matrix:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCorrelationData();
  }, []);



  if (loading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
  </div>;

  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;

  if (!correlationData) return null;

  // Prepare the data in a format suitable for display
  const factors = Object.keys(correlationData);
  
  // Color function for correlation values
  const getColorForValue = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return value > 0 ? 'bg-green-700' : 'bg-red-700';
    if (absValue > 0.5) return value > 0 ? 'bg-green-500' : 'bg-red-500';
    if (absValue > 0.3) return value > 0 ? 'bg-green-300' : 'bg-red-300';
    if (absValue > 0.1) return value > 0 ? 'bg-green-100' : 'bg-red-100';
    return 'bg-gray-100';
  };

  const getTextColor = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue > 0.5) return 'text-white';
    return 'text-gray-800';
  };

  // User-friendly display names
  const displayNames: Record<string, string> = {
    'soil_moisture': 'Soil Moisture',
    'temperature': 'Temperature',
    'rain_1h': 'Rainfall',
    'humidity': 'Humidity',
    'lux': 'Light Intensity',
    'daylight_minutes': 'Daylight Duration'
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-700">Environmental Correlation Matrix</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          This matrix shows the correlation between different environmental factors.
          Values range from -1 (strong negative correlation) to +1 (strong positive correlation).
          0 means no correlation.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 border text-left"></th>
              {factors.map(factor => (
                <th key={factor} className="px-2 py-1 border text-left text-sm">
                  {displayNames[factor] || factor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {factors.map(row => (
              <tr key={row}>
                <th className="px-2 py-1 border text-left text-sm font-medium bg-gray-50">
                  {displayNames[row] || row}
                </th>
                {factors.map(col => {
                  const value = correlationData[row][col];
                  return (
                    <td 
                      key={`${row}-${col}`} 
                      className={`px-2 py-1 border text-center ${getColorForValue(value)} ${getTextColor(value)}`}
                    >
                      {value.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}