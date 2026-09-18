# pyrefly: ignore [missing-import]
import argparse
# pyrefly: ignore [missing-import]
import yaml
# pyrefly: ignore [missing-import]
import sys
# pyrefly: ignore [missing-import]
import os

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data.download_omni import download_omni_data
from data.download_supermag import download_supermag_data
from data.preprocessing import preprocess_data
from models.transformer_encoder import GICTransformer
from models.lstm_baseline import GICLSTM
from models.rf_baseline import GICRandomForest
from engine.trainer import Trainer
from engine.evaluator import Evaluator

def main():
    parser = argparse.ArgumentParser(description="GIC Forecasting Pipeline")
    parser.add_argument('--config', type=str, default='configs/config.yaml', help='Path to config file')
    parser.add_argument('--mode', type=str, choices=['download', 'train', 'eval'], default='train')
    args = parser.parse_args()

    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)

    if args.mode == 'download':
        print("Starting data download...")
        download_omni_data(config['data']['start_year'], config['data']['end_year'], config['data']['omni_dir'])
        download_supermag_data(config['evaluation']['test_stations'], config['data']['start_year'], config['data']['end_year'], config['data']['supermag_dir'])
        print("Download complete.")
        
    elif args.mode == 'train':
        print(f"Starting training for {config['model']['type']}...")
        from data.dataset import GICDataset
        from torch.utils.data import DataLoader
        import torch

        csv_path = os.path.join(config['data']['processed_dir'], 'gic_dataset_2015.csv')
        hist_len = config['windowing']['history_len_mins']
        pred_lead = config['windowing']['pred_lead_mins']
        stride = config['windowing']['stride']

        print("Loading training dataset...")
        train_dataset = GICDataset(csv_path, history_len=hist_len, pred_lead=pred_lead, stride=stride, train=True)
        print("Loading validation dataset...")
        val_dataset = GICDataset(csv_path, history_len=hist_len, pred_lead=pred_lead, stride=stride, train=False, scaler=train_dataset.get_scaler())
        
        train_loader = DataLoader(train_dataset, batch_size=config['training']['batch_size'], shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=config['training']['batch_size'], shuffle=False)

        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {device}")

        if config['model']['type'] == 'transformer':
            model = GICTransformer(
                input_dim=train_dataset.input_dim,
                d_model=config['model']['d_model'],
                nhead=config['model']['nhead'],
                num_layers=config['model']['num_encoder_layers'],
                dim_feedforward=config['model']['dim_feedforward'],
                dropout=config['model']['dropout'],
                num_station_metadata=config['model']['num_station_metadata'],
                output_dim=3
            )
        else:
            raise NotImplementedError(f"Model {config['model']['type']} not implemented yet.")

        trainer = Trainer(model, train_loader, val_loader, config, device=device)
        trainer.run()
        print("Training completed.")
        
    elif args.mode == 'eval':
        print("Starting evaluation...")
        from data.dataset import GICDataset
        from torch.utils.data import DataLoader
        import torch

        csv_path = os.path.join(config['data']['processed_dir'], 'gic_dataset_2015.csv')
        hist_len = config['windowing']['history_len_mins']
        pred_lead = config['windowing']['pred_lead_mins']
        stride = config['windowing']['stride']

        print("Loading training dataset for scaling context...")
        train_dataset = GICDataset(csv_path, history_len=hist_len, pred_lead=pred_lead, stride=stride, train=True)
        print("Loading validation dataset...")
        val_dataset = GICDataset(csv_path, history_len=hist_len, pred_lead=pred_lead, stride=stride, train=False, scaler=train_dataset.get_scaler())
        
        val_loader = DataLoader(val_dataset, batch_size=config['training']['batch_size'], shuffle=False)
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
        )
        model.load_state_dict(torch.load('checkpoints/best_model.pth', map_location=device))
        
        evaluator = Evaluator(model, val_loader, config, device=device)
        metrics = evaluator.evaluate()
        
        print("Evaluation Metrics (Normalized):")
        for k, v in metrics.items():
            print(f"  {k}: {v:.4f}")
            
        print("Evaluation completed.")

if __name__ == "__main__":
    main()
