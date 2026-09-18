# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from sklearn.metrics import mean_squared_error, mean_absolute_error

def pearson_corr(y_true, y_pred):
    # Flatten arrays
    y_true_flat = y_true.flatten()
    y_pred_flat = y_pred.flatten()
    return np.corrcoef(y_true_flat, y_pred_flat)[0, 1]

class Evaluator:
    def __init__(self, model, test_loader, config, device='cpu'):
        self.model = model.to(device)
        self.test_loader = test_loader
        self.config = config
        self.device = device
        
    def evaluate(self):
        self.model.eval()
        all_preds = []
        all_targets = []
        
        with torch.no_grad():
            for x, y, meta in self.test_loader:
                x, y, meta = x.to(self.device), y.to(self.device), meta.to(self.device)
                
                outputs = self.model(x, meta)
                preds = outputs[0] if isinstance(outputs, tuple) else outputs
                all_preds.append(preds.cpu().numpy())
                all_targets.append(y.cpu().numpy())
                
        all_preds = np.concatenate(all_preds, axis=0)
        all_targets = np.concatenate(all_targets, axis=0)
        
        rmse = np.sqrt(mean_squared_error(all_targets, all_preds))
        mae = mean_absolute_error(all_targets, all_preds)
        r = pearson_corr(all_targets, all_preds)
        
        return {
            'rmse': rmse,
            'mae': mae,
            'pearson_r': r
        }
