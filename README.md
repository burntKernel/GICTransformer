# GICTransformer

## 1. Introduction

**GICTransformer** is a deep learning framework that utilizes Transformer Encoders to forecast Geomagnetically Induced Currents (GIC) and specific geoelectric field components during solar storms. By leveraging historical solar wind and Interplanetary Magnetic Field (IMF) data alongside ground station metadata, this model provides critical early warnings to help mitigate potential damage to power grids during severe geomagnetic events.

## 2. Features

*   **Time-Series Forecasting:** Employs a PyTorch-based Multi-Head Attention Transformer Encoder to effectively capture long-term temporal dependencies in solar wind data.
*   **Physics-Aligned Architecture:** Defeats naive "persistence lag" using **Residual (Delta) Prediction** paired with a **Custom Magnitude-Penalty Loss Function**, forcing the model to hunt for and predict incoming high-frequency storm volatility.
*   **Physical Unit Calibration:** Integrates 1D/3D Earth surface impedance scaling ($10^{-3}$) to automatically translate raw predicted nanotesla ($nT$) magnetic variations into highly accurate, real-world Geoelectric Field potentials ($V/km$).
*   **Interactive React Dashboard:** Features a modern, high-fidelity glassmorphism dashboard that provides a minute-by-minute simulation of historic severe solar storms, allowing for visual tracking of predicted versus actual grid impacts.

## 3. Model Architecture

The core of the system is the `GICTransformer` model, which processes data through the following steps:

1.  **Input Projection:** Time-series inputs are projected into a higher-dimensional latent space (`d_model = 64`) via a Linear layer.
2.  **Metadata Fusion:** Static station metadata is passed through a separate Linear layer to create an embedding, which is broadcasted and added directly to the projected sequence.
3.  **Positional Encoding:** Standard sinusoidal positional encoding retains the sequential order of the 120-minute history context window.
4.  **Transformer Encoder:** The fused data is processed through multi-head attention blocks (`nhead = 4`) to extract complex temporal patterns.
5.  **Output Regression Head:** The model predicts the **Residual (Change)** in the magnetic field 30 minutes into the future to eliminate lag artifacts.

## 4. Data Processing

Data preprocessing and loading are handled by the `GICDataset` class:

*   **Sliding Window:** The dataset generates samples using a 120-minute history length and a 30-minute prediction horizon.
*   **Target Residuals:** The target features are dynamically converted to residuals ($\Delta Y = Y_{future} - Y_{present}$) to force strict derivative learning.
*   **Standardization:** Features are standardized using training-set-only scalers to prevent ground-truth data leakage.

## 5. Getting Started & Installation

### Prerequisites

Ensure you have Python 3.8+ and Node.js installed.

```bash
# 1. Install Backend Dependencies
pip install -r requirements.txt

# 2. Install Frontend Dependencies
cd frontend
npm install
```

### Configuration

Model parameters, windowing logic, and dataset paths are managed centrally via `configs/config.yaml`.

## 6. Usage

### Running the Real-Time Dashboard

The project includes an interactive dual-stack dashboard to stream and visualize the model's performance on the historic 2015 St. Patrick's Day storm. 

**1. Start the PyTorch API Backend:**
```bash
# From the project root
python api/app.py
```
*The Flask API will start on `http://127.0.0.1:5000/`.*

**2. Start the React Frontend:**
```bash
# In a new terminal
cd frontend
npm run dev
```
*The dashboard will be available at `http://localhost:5173/`.*

### API Endpoints

*   **`GET /api/simulation/start`**: Initializes the simulation and returns the total number of available simulation steps.
*   **`GET /api/simulation/step/<step>`**: Runs the model inference for a specific minute. Unscales the output and applies the $10^{-3}$ surface impedance scaling factor to return physically accurate $V/km$ potentials.
