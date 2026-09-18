# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn

class GICLSTM(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_layers, dropout, num_station_metadata, output_dim=3):
        super(GICLSTM, self).__init__()
        
        self.hidden_dim = hidden_dim
        
        # Metadata projection to concatenate with inputs or initialize hidden state
        # Here we'll append metadata to the input sequence features
        self.lstm = nn.LSTM(input_dim + num_station_metadata, hidden_dim, num_layers, 
                            batch_first=True, dropout=dropout if num_layers > 1 else 0, bidirectional=True)
        
        # Bidirectional means hidden size is 2 * hidden_dim
        self.regressor = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, output_dim)
        )

    def forward(self, src, meta):
        # src: (batch, seq_len, input_dim)
        # meta: (batch, num_station_metadata)
        
        batch_size, seq_len, _ = src.size()
        
        # Expand metadata to match sequence length and concatenate
        meta_expanded = meta.unsqueeze(1).expand(batch_size, seq_len, -1)
        x = torch.cat([src, meta_expanded], dim=-1)
        
        output, (hn, cn) = self.lstm(x)
        
        # Get last time step
        # Since bidirectional, concatenate the final hidden states from both directions
        last_hidden = torch.cat((hn[-2,:,:], hn[-1,:,:]), dim = 1)
        
        preds = self.regressor(last_hidden)
        return preds
