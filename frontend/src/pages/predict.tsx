import { useState } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PredictPage() {
  const [formData, setFormData] = useState({
    temperature: 25,
    soil_moisture: 50,
    humidity: 60,
    light_intensity: 10000
  });
  
  const [predictionResult, setPredictionResult] = useState<{
    health_score: number;
    health_status: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const dataToSend = {
        ...formData,
        save_to_history: false,
        sensor_id: 0,
      }
      const response = await fetch('http://localhost:8000/api/predict-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      setPredictionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`${geistSans.className} ${geistMono.className} bg-white text-gray-800 min-h-screen`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-green-600">SmartFarm Prediction Tool</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="md:col-span-2">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-700">Plant Health Prediction</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Temperature Input */}
                  <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature (°C)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        id="temperature"
                        name="temperature"
                        min="0"
                        max="50"
                        step="0.1"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-2 w-12 text-center font-mono">
                        {formData.temperature}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0°C</span>
                      <span>25°C</span>
                      <span>50°C</span>
                    </div>
                  </div>
                  
                  {/* Soil Moisture Input */}
                  <div>
                    <label htmlFor="soil_moisture" className="block text-sm font-medium text-gray-700 mb-1">
                      Soil Moisture (%)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        id="soil_moisture"
                        name="soil_moisture"
                        min="0"
                        max="100"
                        value={formData.soil_moisture}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-2 w-12 text-center font-mono">
                        {formData.soil_moisture}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  {/* Humidity Input */}
                  <div>
                    <label htmlFor="humidity" className="block text-sm font-medium text-gray-700 mb-1">
                      Humidity (%)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        id="humidity"
                        name="humidity"
                        min="0"
                        max="100"
                        value={formData.humidity}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-2 w-12 text-center font-mono">
                        {formData.humidity}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  {/* Light Intensity Input */}
                  <div>
                    <label htmlFor="light_intensity" className="block text-sm font-medium text-gray-700 mb-1">
                      Light Intensity (lux)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        id="light_intensity"
                        name="light_intensity"
                        min="0"
                        max="100000"
                        step="1000"
                        value={formData.light_intensity}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-2 w-16 text-center font-mono">
                        {formData.light_intensity}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>50k</span>
                      <span>100k</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200"
                  >
                    {loading ? 'Calculating...' : 'Predict Plant Health'}
                  </button>
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="md:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-6 h-full">
              <h2 className="text-xl font-semibold mb-6 text-gray-700">Prediction Results</h2>
              
              {predictionResult ? (
                <div className="flex flex-col items-center justify-center h-64">
                
                  <div className={`text-center px-4 py-2 rounded-full text-white font-medium ${
                    predictionResult.health_status === 'Healthy' ? 'bg-green-500' :
                    predictionResult.health_status === 'Moderate Stress' ? 'bg-yellow-500' :
                    predictionResult.health_status === 'High Stress' ? 'bg-red-500' : ''
                  }`}>
                    {predictionResult.health_status}
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-gray-600">
                    {predictionResult.health_status === 'Healthy' ? 'Perfect growing conditions!' :
                     predictionResult.health_status === 'Moderate Stress' ? 'Some parameters need improvement.' :
                     predictionResult.health_status === 'High Stress' ? 'Plants may struggle under these conditions.' :
                     ''}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                  <p className="mt-4 text-center">
                    Enter your plant environmental parameters<br />
                    and click "Predict" to see results
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Information</h3>
              <p className="text-xs text-blue-700">
                This tool uses a machine learning model trained on historical data to predict plant health 
                based on environmental factors. Optimal conditions vary by plant species, but generally:
              </p>
              <ul className="text-xs text-blue-700 mt-2 list-disc list-inside">
                <li>Soil moisture: 40-60%</li>
                <li>Temperature: 18-26°C</li>
                <li>Humidity: 50-70%</li>
                <li>Light intensity: 10,000-30,000 lux</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
