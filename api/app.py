import os
import sys
import yaml
import torch
import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template
from flask_cors import CORS

# Add ml dir to path to import model and data
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml'))

from data.dataset import GICDataset
from models.transformer_encoder import GICTransformer

app = Flask(__name__)
CORS(app)

# Global state
model = None
val_dataset = None
df_full = None
device = None
config = None
split_idx = 0
hist_len = 0
pred_lead = 0
target_mean = None
target_std = None
storm_indices = []

def init_app():
    global model, val_dataset, df_full, device, config, split_idx, hist_len, pred_lead
    global target_mean, target_std, storm_indices

    print("Initializing Backend...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Check root configs/config.yaml or ml/configs/config.yaml
    config_path = os.path.join(base_dir, 'configs', 'config.yaml')
    if not os.path.exists(config_path):
        config_path = os.path.join(base_dir, 'ml', 'configs', 'config.yaml')

    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found at '{config_path}'")

    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)

    # Check processed CSV path
    proc_dir = config['data']['processed_dir']
    csv_path = os.path.join(base_dir, proc_dir, 'gic_dataset_2015.csv')
    if not os.path.exists(csv_path):
        csv_path = os.path.join(base_dir, 'ml', proc_dir, 'gic_dataset_2015.csv')

    print(f"Config loaded from: {config_path}")
    print(f"Dataset path: {csv_path}")

    if not os.path.exists(csv_path):
        print(f"WARNING: Dataset CSV not found at '{csv_path}'. Run data generation script to produce gic_dataset_2015.csv.")
        return

    hist_len = config['windowing']['history_len_mins']
    pred_lead = config['windowing']['pred_lead_mins']
    
    print("Loading datasets...")
    train_dataset = GICDataset(csv_path, history_len=hist_len, pred_lead=pred_lead, stride=config['windowing']['stride'], train=True)
    val_dataset = GICDataset(csv_path, history_len=hist_len, pred_lead=pred_lead, stride=1, train=False, scaler=train_dataset.get_scaler())
    
    _, _, target_mean, target_std = train_dataset.get_scaler()

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = GICTransformer(
        input_dim=train_dataset.input_dim,
        d_model=config['model']['d_model'],
        nhead=config['model']['nhead'],
        num_layers=config['model']['num_encoder_layers'],
        dim_feedforward=config['model']['dim_feedforward'],
        dropout=config['model']['dropout'],
        num_station_metadata=config['model']['num_station_metadata'],
        output_dim=3
    ).to(device)

    model_path = os.path.join(base_dir, 'checkpoints', 'best_model.pth')
    if not os.path.exists(model_path):
        model_path = os.path.join(base_dir, 'ml', 'checkpoints', 'best_model.pth')

    if os.path.exists(model_path):
        print(f"Loading checkpoint from: {model_path}")
        model.load_state_dict(torch.load(model_path, map_location=device))
    else:
        print(f"NOTICE: Checkpoint not found at '{model_path}'. Running with initialized model weights.")

    model.eval()

    df_full = pd.read_csv(csv_path, index_col=0, parse_dates=True)
    split_idx = int(len(df_full) * 0.8)
    
    # Pre-calculate storm indices (December 6 storm)
    storm_day = '2015-12-06'
    storm_start = pd.to_datetime(storm_day) - pd.Timedelta(hours=4)
    storm_end = pd.to_datetime(storm_day) + pd.Timedelta(hours=12)
    
    for i in range(len(val_dataset)):
        start_idx = val_dataset.indices[i]
        pred_idx = start_idx + hist_len + pred_lead - 1
        actual_idx_in_full = split_idx + pred_idx
        dt = df_full.index[actual_idx_in_full]
        
        if storm_start <= dt <= storm_end:
            storm_indices.append(i)

    print(f"Backend Ready! Loaded {len(storm_indices)} minutes of storm data for simulation.")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/simulation/start')
def start_simulation():
    return jsonify({"total_steps": len(storm_indices)})

@app.route('/api/simulation/step/<int:step>')
def get_step(step):
    if step < 0 or step >= len(storm_indices):
        return jsonify({"error": "Step out of bounds"}), 400
        
    idx = storm_indices[step]
    x, y_true_scaled = val_dataset[idx]
    
    start_idx = val_dataset.indices[idx]
    pred_idx = start_idx + hist_len + pred_lead - 1
    actual_idx_in_full = split_idx + pred_idx
    dt = df_full.index[actual_idx_in_full]

    with torch.no_grad():
        x_batch = x.unsqueeze(0).to(device)
        meta = torch.zeros(1, config['model']['num_station_metadata']).to(device)
        outputs = model(x_batch, meta)
        preds = outputs[0] if isinstance(outputs, tuple) else outputs
        pred_scaled = preds[0].cpu().numpy()
        
    y_true_scaled = y_true_scaled.numpy()
    
    pred_unscaled = (pred_scaled * target_std) + target_mean
    y_true_unscaled = (y_true_scaled * target_std) + target_mean

    return jsonify({
        "timestamp": dt.strftime('%H:%M'),
        "true_ykcx": float(y_true_unscaled[0]),
        "pred_ykcx": float(pred_unscaled[0])
    })

if __name__ == '__main__':
    init_app()
    app.run(debug=True, port=5000, use_reloader=False)
