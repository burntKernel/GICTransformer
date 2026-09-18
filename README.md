# GICTransformer

## 1. Introduction

**GICTransformer** is a deep learning framework that utilizes Transformer Encoders to forecast Geomagnetically Induced Currents (GIC) and specific geoelectric field components during solar storms. By leveraging historical solar wind and Interplanetary Magnetic Field (IMF) data alongside ground station metadata, this model provides critical early warnings to help mitigate potential damage to power grids during severe geomagnetic events.

## 2. Features

*   **Time-Series Forecasting:** Employs a PyTorch-based Multi-Head Attention Transformer Encoder to effectively capture long-term temporal dependencies in solar wind data.
*   **Multimodal Input Fusion:** Seamlessly combines sequential solar wind/IMF data with static station metadata (such as latitude and longitude embeddings) before processing through the transformer blocks.
*   **Interactive Simulation Dashboard:** Features a Flask-based web dashboard that provides a minute-by-minute simulation of the historic December 6, 2015, severe solar storm, allowing for visual comparison of predicted versus actual values.

## 3. Model Architecture

The core of the system is the `GICTransformer` model, which processes data through the following steps:

1.  **Input Projection:** Time-series inputs are projected into a higher-dimensional latent space (`d_model`) via a Linear layer.
2.  **Metadata Fusion:** Static station metadata is passed through a separate Linear layer to create an embedding, which is then broadcasted and added directly to the projected time-series sequence.
3.  **Positional Encoding:** Standard sinusoidal positional encoding is added to retain the sequential order of the time-series data.
4.  **Transformer Encoder:** The fused data is processed through multi-head attention `nn.TransformerEncoderLayer` blocks to extract complex temporal patterns.
5.  **Output Regression Head:** The representation from the final time step is extracted and passed through a Multi-Layer Perceptron (Linear $\rightarrow$ ReLU $\rightarrow$ Dropout $\rightarrow$ Linear) to produce the final 3-dimensional prediction (e.g., $E_x$, $E_y$, and $E_{mag}$ or GIC components).

## 4. Data Processing

Data preprocessing and loading are handled by the `GICDataset` class:

*   **Sliding Window:** The dataset generates samples using a sliding window approach with a configurable history length (`history_len_mins`) and prediction lead time (`pred_lead_mins`).
*   **Standardization:** Features and targets are scaled using standard scaling. Crucially, the scaler is fit *only* on the training dataset to prevent data leakage. During inference, model predictions are dynamically unscaled to match real-world physical units.

## 5. Getting Started & Installation

### Prerequisites

Ensure you have Python 3.8+ installed. You can install the required dependencies using the provided `requirements.txt`.

```bash
pip install -r requirements.txt
```

*(Key dependencies include `torch`, `pandas`, `numpy`, `flask`, `flask-cors`, and `pyyaml`)*

### Configuration

Model parameters, windowing logic, and dataset paths are managed centrally via `configs/config.yaml`. Ensure your datasets are placed in the configured directories before running experiments or the dashboard.

## 6. Usage

### Running the Dashboard

The project includes an interactive dashboard to visualize the model's performance on the December 6, 2015 storm. 

To start the dashboard backend:

```bash
python dashboard/app.py
```

The Flask API will start on `http://127.0.0.1:5000/`.

### API Endpoints

*   **`GET /api/simulation/start`**: Initializes the simulation and returns the total number of available simulation steps (minutes) for the storm.
*   **`GET /api/simulation/step/<step>`**: Runs the model inference for a specific minute in the simulation, returning the timestamp, true value, and predicted value unscaled.
