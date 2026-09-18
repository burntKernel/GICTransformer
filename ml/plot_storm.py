import torch
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yaml
import os
from data.dataset import GICDataset
from models.transformer_encoder import GICTransformer

def main():
    # Load config
    with open('configs/config.yaml', 'r') as f:
        config = yaml.safe_load(f)

    # Setup parameters
    csv_path = os.path.join(config['data']['processed_dir'], 'gic_dataset_2015.csv')
    hist_len = config['windowing']['history_len_mins']
    pred_lead = config['windowing']['pred_lead_mins']
    stride = config['windowing']['stride']

    print("Loading datasets...")
    train_dataset = GICDataset(csv_path, history_len=hist_len, pred_lead=pred_lead, stride=stride, train=True)
    val_dataset = GICDataset(csv_path, history_len=hist_len, pred_lead=pred_lead, stride=stride, train=False, scaler=train_dataset.get_scaler())

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

    print("Loading model weights...")
    model.load_state_dict(torch.load('checkpoints/best_model.pth', map_location=device))
    model.eval()

    # We need the original unscaled data for dates
    df_full = pd.read_csv(csv_path, index_col=0, parse_dates=True)
    split_idx = int(len(df_full) * 0.8)
    df_val = df_full.iloc[split_idx:].copy()
    
    # We will iterate through the val_dataset to get predictions
    # Note: val_dataset indices are spaced by `stride`
    print("Generating predictions on validation set...")
    preds = []
    targets = []
    target_dates = []

    with torch.no_grad():
        for i in range(len(val_dataset)):
            x, y = val_dataset[i]
            x_batch = x.unsqueeze(0).to(device)
            meta = torch.zeros(1, config['model']['num_station_metadata']).to(device)
            pred, _ = model(x_batch, meta)
            
            preds.append(pred.cpu().numpy()[0])
            targets.append(y.numpy())
            
            # Find the actual date for this prediction
            start_idx = val_dataset.indices[i]
            pred_idx = start_idx + hist_len + pred_lead - 1
            # We must offset by split_idx to get the right date in df_full
            # Wait, val_dataset internal df starts from split_idx
            actual_idx_in_full = split_idx + pred_idx
            target_dates.append(df_full.index[actual_idx_in_full])

    preds = np.array(preds)
    targets = np.array(targets)
    
    # Inverse transform
    _, _, target_mean, target_std = train_dataset.get_scaler()
    preds_unscaled = (preds * target_std) + target_mean
    targets_unscaled = (targets * target_std) + target_mean

    # Create a DataFrame for easy plotting
    df_results = pd.DataFrame(index=target_dates)
    df_results['True_YKCX'] = targets_unscaled[:, 0]
    df_results['Pred_YKCX'] = preds_unscaled[:, 0]
    
    # In the validation set (the last 20% of 2015, which is approx mid-Oct to Dec), 
    # we don't have the St. Patrick's Day storm (March). 
    # Let's plot the largest storm in the validation set instead!
    
    # Find the day with the largest variance/drop in YKCX in the val set
    daily_min = df_results['True_YKCX'].resample('D').min()
    storm_day = daily_min.idxmin().strftime('%Y-%m-%d')
    print(f"Largest magnetic disturbance in validation set occurred on: {storm_day}")
    
    # Zoom in on a 3-day window around the storm
    storm_start = pd.to_datetime(storm_day) - pd.Timedelta(days=1)
    storm_end = pd.to_datetime(storm_day) + pd.Timedelta(days=2)
    
    df_storm = df_results[(df_results.index >= storm_start) & (df_results.index <= storm_end)]

    # Plot
    print("Plotting...")
    plt.figure(figsize=(14, 6))
    plt.plot(df_storm.index, df_storm['True_YKCX'], label='True YKCX (Ground Truth)', color='black', alpha=0.8, linewidth=1.5)
    plt.plot(df_storm.index, df_storm['Pred_YKCX'], label=f'Predicted YKCX ({pred_lead} min ahead)', color='red', alpha=0.7, linewidth=1.5)
    
    plt.title(f"GIC Transformer: Ground Magnetic Field Prediction (YKCX) around {storm_day}")
    plt.ylabel("Magnetic Field (nT)")
    plt.xlabel("Time (UTC)")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    
    # Save to artifacts directory
    save_path = r"c:\Users\basap\.gemini\antigravity-ide\brain\5405f5f5-cc78-4427-9da5-33f9943dbf10\storm_plot.png"
    plt.savefig(save_path, dpi=300)
    print(f"Saved plot to {save_path}")

if __name__ == "__main__":
    main()
