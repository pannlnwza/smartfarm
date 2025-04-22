import {useState} from 'react';
import {Geist, Geist_Mono} from "next/font/google";
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
        light_intensity: 4000
    });

    const [predictionMode, setPredictionMode] = useState<'health' | 'moisture'>('health');

    const [healthPrediction, setHealthPrediction] = useState<{
        health_score: number;
        health_status: string;
    } | null>(null);

    const [moisturePrediction, setMoisturePrediction] = useState<{
        soil_moisture: number;
        recommendation: string;
    } | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handleHealthSubmit = async (e: React.FormEvent) => {
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
            setHealthPrediction(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleMoistureSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const dataToSend = {
                temperature: formData.temperature,
                humidity: formData.humidity,
                light_intensity: formData.light_intensity
            }
            const response = await fetch('http://localhost:8000/api/predict-moisture', {
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
            setMoisturePrediction(result);
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
                    <h1 className="text-3xl font-bold text-black">SmartFarm Prediction Tool</h1>
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

                {/* Prediction Mode Selector */}
                <div className="mb-6 flex justify-left">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                            type="button"
                            onClick={() => setPredictionMode('health')}
                            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                                predictionMode === 'health'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-200`}
                        >
                            Plant Health Prediction
                        </button>
                        <button
                            type="button"
                            onClick={() => setPredictionMode('moisture')}
                            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                                predictionMode === 'moisture'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-200`}
                        >
                            Soil Moisture Prediction
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-2">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-6 text-gray-700">
                                {predictionMode === 'health' ? 'Plant Health Prediction' : 'Soil Moisture Prediction'}
                            </h2>

                            {predictionMode === 'health' ? (
                                <form onSubmit={handleHealthSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Temperature Input */}
                                        <div>
                                            <label htmlFor="temperature"
                                                   className="block text-sm font-medium text-gray-700 mb-1">
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
                                            <label htmlFor="soil_moisture"
                                                   className="block text-sm font-medium text-gray-700 mb-1">
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
                                            <label htmlFor="humidity"
                                                   className="block text-sm font-medium text-gray-700 mb-1">
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
                                            <label htmlFor="light_intensity"
                                                   className="block text-sm font-medium text-gray-700 mb-1">
                                                Light Intensity (lux)
                                            </label>
                                            <div className="flex items-center">
                                                <input
                                                    type="range"
                                                    id="light_intensity"
                                                    name="light_intensity"
                                                    min="0"
                                                    max="10000"
                                                    step="100"
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
                                                <span>5k</span>
                                                <span>10k</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition duration-200"
                                        >
                                            {loading ? 'Calculating...' : 'Predict Plant Health'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleMoistureSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Temperature Input */}
                                        <div>
                                            <label htmlFor="temperature"
                                                   className="block text-sm font-medium text-gray-700 mb-1">
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

                                        {/* Humidity Input */}
                                        <div>
                                            <label htmlFor="humidity"
                                                   className="block text-sm font-medium text-gray-700 mb-1">
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
                                            <label htmlFor="light_intensity"
                                                   className="block text-sm font-medium text-gray-700 mb-1">
                                                Light Intensity (lux)
                                            </label>
                                            <div className="flex items-center">
                                                <input
                                                    type="range"
                                                    id="light_intensity"
                                                    name="light_intensity"
                                                    min="0"
                                                    max="10000"
                                                    step="100"
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
                                                <span>5k</span>
                                                <span>10k</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition duration-200"
                                        >
                                            {loading ? 'Calculating...' : 'Predict Soil Moisture'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {error && (
                                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="md:col-span-1">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-6 text-gray-700">Prediction Results</h2>

                            {predictionMode === 'health' ? (
                                healthPrediction ? (
                                    <div className="flex flex-col items-center justify-center h-64">
                                        <div className={`text-center px-4 py-2 rounded-full text-white font-medium ${
                                            healthPrediction.health_status === 'Healthy' ? 'bg-green-500' :
                                                healthPrediction.health_status === 'Moderate Stress' ? 'bg-yellow-500' :
                                                    healthPrediction.health_status === 'High Stress' ? 'bg-red-500' : ''
                                        }`}>
                                            {healthPrediction.health_status}
                                        </div>

                                        <div className="mt-4 text-center text-sm text-gray-600">
                                            {healthPrediction.health_status === 'Healthy' ? 'Perfect growing conditions!' :
                                                healthPrediction.health_status === 'Moderate Stress' ? 'Some parameters need improvement.' :
                                                    healthPrediction.health_status === 'High Stress' ? 'Plants may struggle under these conditions.' :
                                                        ''}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                                             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                             strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 16v-4"></path>
                                            <path d="M12 8h.01"></path>
                                        </svg>
                                        <p className="mt-4 text-center">
                                            Enter your plant environmental parameters<br/>
                                            and click "Predict" to see results
                                        </p>
                                    </div>
                                )
                            ) : (
                                moisturePrediction ? (
                                    <div className="flex flex-col items-center justify-center h-64">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {moisturePrediction.soil_moisture.toFixed(2)}%
                                        </div>

                                        <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
                                            <div
                                                className="bg-blue-600 h-4 rounded-full"
                                                style={{width: `${Math.min(100, moisturePrediction.predicted_moisture)}%`}}
                                            ></div>
                                        </div>

                                        <div className="mt-4 text-center text-sm text-gray-600">
                                            {moisturePrediction.recommendation}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                                             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                             strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2v6"></path>
                                            <path d="M5 5.3l4.8 2.8"></path>
                                            <path d="M2 12h6"></path>
                                            <path d="M5 18.7l4.8-2.8"></path>
                                            <path d="M12 16v6"></path>
                                            <path d="M19 18.7l-4.8-2.8"></path>
                                            <path d="M22 12h-6"></path>
                                            <path d="M19 5.3l-4.8 2.8"></path>
                                        </svg>
                                        <p className="mt-4 text-center">
                                            Enter environmental parameters<br/>
                                            to predict optimal soil moisture
                                        </p>
                                    </div>
                                )
                            )}
                        </div>

                        <div
                            className={`${predictionMode === 'health' ? 'bg-blue-50' : 'bg-green-50'} rounded-lg p-4 mt-4`}>
                            <h3 className={`text-sm font-medium ${predictionMode === 'health' ? 'text-blue-800' : 'text-green-800'} mb-2`}>Information</h3>

                            {predictionMode === 'health' ? (
                                <>
                                    <p className="text-xs text-blue-700">
                                        This tool uses a machine learning model trained on historical data to predict
                                        plant health
                                        based on environmental factors. Optimal conditions vary by plant species, but
                                        generally:
                                    </p>

                                </>
                            ) : (
                                <>
                                    <p className="text-xs text-green-700">
                                        This prediction uses environmental factors to estimate ideal soil moisture
                                        levels.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}