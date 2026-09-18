# pyrefly: ignore [missing-import]
import matplotlib.pyplot as plt
# pyrefly: ignore [missing-import]
import seaborn as sns
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
import os

def plot_attention_map(attention_weights, feature_names, time_steps, save_path=None):
    """
    Plots a heatmap of attention weights.
    attention_weights: (seq_len, seq_len) or (num_heads, seq_len, seq_len)
    """
    plt.figure(figsize=(10, 8))
    
    if len(attention_weights.shape) == 3:
        # Average across heads
        attention_weights = np.mean(attention_weights, axis=0)
        
    sns.heatmap(attention_weights, cmap='viridis')
    plt.title('Self-Attention Heatmap')
    plt.xlabel('Key Sequence Index')
    plt.ylabel('Query Sequence Index')
    
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path)
    else:
        plt.show()
    plt.close()
