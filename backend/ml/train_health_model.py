import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error
import joblib
import numpy as np

# Load data
df = pd.read_csv("plant_moniter_health_data.csv")

# Features and target
features = ['temperature', 'soil_moisture', 'humidity', 'light_intensity']
X = df[features]
y = df['health_score']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Normalize features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Random Forest model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Predict and evaluate
y_pred = model.predict(X_test_scaled)
r2 = r2_score(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))

print(f"R2 Score: {r2:.2f}")
print(f"RMSE: {rmse:.2f}")

# Save the model and scaler
joblib.dump(model, "plant_health_score_model.pkl")
joblib.dump(scaler, "scaler.pkl")
