# SmartFarm

SmartFarm is an intelligent farming assistant that helps monitor and optimize plant care using real-time sensor data and predictive analytics. It combines hardware sensors, environmental APIs, and ML models to provide actionable insights for your plants.

## Features

SmartFarm helps you answer key questions about your plants:

- **When should I water my plants?** - Get precise watering recommendations based on soil moisture levels, temperature, light intensity, and rain forecasts
- **Is the temperature safe?** - Monitor environmental conditions to ensure optimal growing conditions
- **Is the moisture too low?** - Receive alerts when soil moisture drops below critical thresholds
- **When will it rain?** - Get accurate rain forecasts to help with watering decisions
- **Plant health assessment** - AI-powered health evaluation based on environmental factors

## Technology Stack

- **Backend**: FastAPI, MySQL database
- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **ML Models**: Scikit-learn for plant health and moisture prediction

## Installation

### Prerequisites

- Python 3.8+
- Node.js 14.0+
- npm or yarn
- MySQL database

### Clone the Repository

```bash
git clone https://github.com/pannlnwza/smartfarm.git
cd smartfarm
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Database configuration is already set in `config.py` with the following default settings:
   ```python
   DB_HOST: str = "iot.cpe.ku.ac.th"
   DB_USER: str = "b6610545901"
   DB_PASSWORD: str = "pattapon.g@ku.th"
   DB_NAME: str = "b6610545901"
   ```
   Update these values if needed for your environment.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Application

### Backend

1. Navigate to the backend directory (if not already there):
   ```bash
   cd backend
   ```

2. Activate the virtual environment if not already activated:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`.
   
   You can access the interactive API documentation at `http://localhost:8000/docs`.

### Frontend

1. Navigate to the frontend directory (if not already there):
   ```bash
   cd frontend
   ```

2. Start the NextJS development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The frontend will be available at `http://localhost:3000`.

## API Endpoints

### Sensor Data Endpoints

- `GET /api/sensor-data` - Get all sensor data
- `GET /api/sensor-data/recent` - Get sensor data from the last 24 hours

### Weather Data Endpoints

- `GET /api/weather-data` - Get all weather data
- `GET /api/weather-data/latest` - Get the most recent weather data
- `GET /api/weather-data/recent` - Get weather data from the last 24 hours

### Sun Data Endpoints

- `GET /api/sun-data` - Get the latest sunrise/sunset data
- `GET /api/sun-data/latest` - Get sunrise/sunset data from the last 24 hours

### Prediction Endpoints

- `POST /api/predict-health` - Predict plant health based on environmental factors
- `POST /api/watering-recommendation` - Get watering recommendations
- `GET /api/when-will-it-rain` - Get rain forecasts
- `POST /api/predict-moisture` - Predict soil moisture based on environmental factors
- `GET /api/correlation-matrix` - Get correlation matrix between environmental factors
- `GET /api/health-history` - Get plant health history

## Machine Learning Models

SmartFarm uses several ML models for its predictions:

1. **Plant Health Model** - Evaluates plant health status based on:
   - Ambient temperature
   - Soil moisture
   - Humidity
   - Light intensity

2. **Soil Moisture Model** - Predicts soil moisture based on:
   - Ambient temperature
   - Humidity
   - Light intensity

3. **Watering Recommendation System** - Combines sensor data and rain forecasts to provide optimized watering advice

## Data Visualization

The frontend includes several visualization components:

- Environmental factor correlation matrix
- Temperature and moisture trends
- Plant health history
- Light intensity patterns

