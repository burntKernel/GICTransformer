# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn
# pyrefly: ignore [missing-import]
from torch.optim import AdamW
# pyrefly: ignore [missing-import]
from torch.utils.data import DataLoader
# pyrefly: ignore [missing-import]
from tqdm import tqdm
# pyrefly: ignore [missing-import]
import os

class Trainer:
    def __init__(self, model, train_loader, val_loader, config, device='cpu'):
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.config = config
        self.device = device
        
        self.criterion = nn.MSELoss()
        self.optimizer = AdamW(self.model.parameters(), 
                               lr=self.config['training']['learning_rate'],
                               weight_decay=self.config['training']['weight_decay'])
                               
    def train_epoch(self):
        self.model.train()
        total_loss = 0
        for x, y in tqdm(self.train_loader, desc="Training"):
            # Assume dummy meta for now, in reality this comes from dataset
            meta = torch.zeros(x.size(0), self.config['model']['num_station_metadata'])
            x, y, meta = x.to(self.device), y.to(self.device), meta.to(self.device)
            
            self.optimizer.zero_grad()
            outputs = self.model(x, meta)
            preds = outputs[0] if isinstance(outputs, tuple) else outputs
            loss = self.criterion(preds, y)
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
        return total_loss / len(self.train_loader)
        
    def val_epoch(self):
        self.model.eval()
        total_loss = 0
        with torch.no_grad():
            for x, y in self.val_loader:
                meta = torch.zeros(x.size(0), self.config['model']['num_station_metadata'])
                x, y, meta = x.to(self.device), y.to(self.device), meta.to(self.device)
                
                outputs = self.model(x, meta)
                preds = outputs[0] if isinstance(outputs, tuple) else outputs
                loss = self.criterion(preds, y)
                total_loss += loss.item()
        return total_loss / len(self.val_loader)
        
    def run(self):
        best_val_loss = float('inf')
        patience_counter = 0
        
        for epoch in range(self.config['training']['epochs']):
            train_loss = self.train_epoch()
            val_loss = self.val_epoch()
            
            print(f"Epoch {epoch+1}: Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                os.makedirs('checkpoints', exist_ok=True)
                torch.save(self.model.state_dict(), 'checkpoints/best_model.pth')
            else:
                patience_counter += 1
                if patience_counter >= self.config['training']['patience']:
                    print("Early stopping triggered.")
                    break
