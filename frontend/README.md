# Frontend

This directory is intended for the frontend application (e.g., React, Vue, or Vite).

## Backend API
The backend Flask API is located in the `../api` directory.
To start the API, run:
```bash
cd ../api
python app.py
```
The API will run on `http://127.0.0.1:5000/`.

## Endpoints
*   **`GET /api/simulation/start`**: Initializes the simulation.
*   **`GET /api/simulation/step/<step>`**: Runs the model inference for a specific minute.
