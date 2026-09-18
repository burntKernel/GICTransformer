import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset

class GICDataset(Dataset):
    def __init__(self, csv_path, history_len=120, pred_lead=30, stride=15, 
                 train=True, train_split=0.8, scaler=None):
        df = pd.read_csv(csv_path, index_col=0, parse_dates=True)
        
        # Interpolate missing values (limit interpolation to small gaps, then fillna with 0)
        df = df.interpolate(method='time', limit=60)
        df = df.ffill().bfill().fillna(0)
        
        # We will predict YKCX, YKCY, YKCZ
        self.target_cols = ['YKCX', 'YKCY', 'YKCZ']
        self.feature_cols = [c for c in df.columns]
        
        # Split train/val chronologically
        split_idx = int(len(df) * train_split)
        if train:
            df = df.iloc[:split_idx]
        else:
            df = df.iloc[split_idx:]
            
        # Extract numpy arrays
        features = df[self.feature_cols].values
        targets = df[self.target_cols].values
        
        # Normalize (Standard Scaling)
        if train:
            self.feature_mean = features.mean(axis=0)
            self.feature_std = features.std(axis=0)
            self.feature_std[self.feature_std == 0] = 1.0 # Avoid division by zero
            self.target_mean = targets.mean(axis=0)
            self.target_std = targets.std(axis=0)
            self.target_std[self.target_std == 0] = 1.0
        else:
            assert scaler is not None, "Must pass training scaler for validation data"
            self.feature_mean, self.feature_std, self.target_mean, self.target_std = scaler
            
        self.features = (features - self.feature_mean) / self.feature_std
        self.targets = (targets - self.target_mean) / self.target_std
        
        self.history_len = history_len
        self.pred_lead = pred_lead
        self.stride = stride
        
        # Calculate valid indices for sliding window
        self.indices = []
        total_len = len(df)
        for i in range(0, total_len - history_len - pred_lead + 1, stride):
            self.indices.append(i)
            
        self.input_dim = len(self.feature_cols)

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        start_idx = self.indices[idx]
        hist_end = start_idx + self.history_len
        pred_idx = hist_end + self.pred_lead - 1 # Target at exact pred_lead horizon
        
        x = self.features[start_idx:hist_end]
        y = self.targets[pred_idx]
        
        return torch.tensor(x, dtype=torch.float32), torch.tensor(y, dtype=torch.float32)
        
    def get_scaler(self):
        return (self.feature_mean, self.feature_std, self.target_mean, self.target_std)
