import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset

import xml.etree.ElementTree as ET

class GICDataset(Dataset):
    def __init__(self, csv_path, history_len=120, pred_lead=30, stride=15, 
                 train=True, train_split=0.8, scaler=None):
        df = pd.read_csv(csv_path, index_col=0, parse_dates=True)
        
        # Interpolate missing values (limit interpolation to small gaps, then fillna with 0)
        df = df.interpolate(method='time', limit=60)
        df = df.ffill().bfill().fillna(0)
        
        # We will predict YKCX, YKCY, YKCZ
        self.target_cols = ['YKCX', 'YKCY', 'YKCZ']
        # RESTORE the ground magnetic fields into the input features!
        # We prevent persistence forecasting by predicting the RESIDUAL instead.
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
        self.station = "YKC"

        # Load MT Metadata
        self.metadata_tensor = self.load_mt_metadata(self.station)

    def load_mt_metadata(self, station):
        import os
        mt_file = f"data/raw/mt/{station}_mt.xml"
        if not os.path.exists(mt_file):
            mt_file = f"../data/raw/mt/{station}_mt.xml" 
        
        meta_vals = []
        try:
            tree = ET.parse(mt_file)
            root = tree.getroot()
            for period in root.iter('Period'):
                z = period.find('Z')
                if z is not None:
                    for val in z.findall('value'):
                        parts = val.text.strip().split()
                        meta_vals.extend([float(parts[0]), float(parts[1])])
        except Exception as e:
            meta_vals = [0.0] * 8
            
        meta_vals = meta_vals[:8]
        if len(meta_vals) < 8:
            meta_vals.extend([0.0] * (8 - len(meta_vals)))
            
        return torch.tensor(meta_vals, dtype=torch.float32)

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        start_idx = self.indices[idx]
        hist_end = start_idx + self.history_len
        pred_idx = hist_end + self.pred_lead - 1 # Target at exact pred_lead horizon
        
        x = self.features[start_idx:hist_end]
        
        y_present = self.targets[hist_end - 1]
        y_future = self.targets[pred_idx]
        
        # PREDICT THE RESIDUAL (CHANGE) INSTEAD OF ABSOLUTE
        y_residual = y_future - y_present
        
        return torch.tensor(x, dtype=torch.float32), torch.tensor(y_residual, dtype=torch.float32), self.metadata_tensor
        
    def get_scaler(self):
        return (self.feature_mean, self.feature_std, self.target_mean, self.target_std)
