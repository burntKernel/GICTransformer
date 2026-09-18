# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn
# pyrefly: ignore [missing-import]
import math
import torch.nn.functional as F

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, dropout=0.1, max_len=5000):
        super(PositionalEncoding, self).__init__()
        self.dropout = nn.Dropout(p=dropout)

        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        if d_model % 2 != 0:
            pe[:, 1::2] = torch.cos(position * div_term)[:, :-1]
        else:
            pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0).transpose(0, 1) # (max_len, 1, d_model)
        self.register_buffer('pe', pe)

    def forward(self, x):
        # x shape: (seq_len, batch_size, d_model)
        x = x + self.pe[:x.size(0), :]
        return self.dropout(x)

class GatedResidualNetwork(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, dropout=0.1):
        super(GatedResidualNetwork, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.elu = nn.ELU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        self.dropout = nn.Dropout(dropout)
        
        # GLU gating
        self.gate = nn.Linear(input_dim, output_dim * 2)
        
        if input_dim != output_dim:
            self.skip_layer = nn.Linear(input_dim, output_dim)
        else:
            self.skip_layer = None
            
        self.layer_norm = nn.LayerNorm(output_dim)

    def forward(self, x, context=None):
        # Optional context conditioning could be added here
        res = x if self.skip_layer is None else self.skip_layer(x)
        
        x_hid = self.fc1(x)
        x_hid = self.elu(x_hid)
        x_hid = self.fc2(x_hid)
        x_hid = self.dropout(x_hid)
        
        gate_out = self.gate(x)
        gate_val, gate_sig = gate_out.chunk(2, dim=-1)
        gate_val = torch.sigmoid(gate_sig) * gate_val # GLU
        
        return self.layer_norm(res + gate_val)

class GICTransformer(nn.Module):
    def __init__(self, input_dim, d_model, nhead, num_layers, dim_feedforward, dropout, num_station_metadata, output_dim=3):
        super(GICTransformer, self).__init__()
        self.d_model = d_model
        
        # Feature projection
        self.input_linear = nn.Linear(input_dim, d_model)
        
        # [CLS] Token
        self.cls_token = nn.Parameter(torch.randn(1, 1, d_model))
        
        # Positional Encoding
        self.pos_encoder = PositionalEncoding(d_model, dropout)
        
        # Metadata Gating (project metadata then use it to gate the temporal sequence)
        self.meta_linear = nn.Linear(num_station_metadata, d_model)
        self.meta_grn = GatedResidualNetwork(d_model, dim_feedforward, d_model, dropout)
        
        # Transformer Encoder (using custom manual loop to get attention weights)
        self.layers = nn.ModuleList([
            nn.TransformerEncoderLayer(d_model, nhead, dim_feedforward, dropout, batch_first=True)
            for _ in range(num_layers)
        ])
        
        # Regression head taking CLS token for Ex, Ey, and E_mag
        self.regressor = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_model // 2, output_dim)
        )

    def forward(self, src, meta):
        # src: (batch, seq_len, features)
        # meta: (batch, num_station_metadata)
        
        batch_size = src.size(0)
        
        x = self.input_linear(src) # (batch, seq_len, d_model)
        
        # Process Metadata
        meta_emb = self.meta_linear(meta).unsqueeze(1) # (batch, 1, d_model)
        
        # Use GRN to gate time-series with metadata context
        # We can just add them and pass through GRN to refine
        x = x + meta_emb
        x = self.meta_grn(x)
        
        # Prepend [CLS] token
        cls_tokens = self.cls_token.expand(batch_size, -1, -1) # (batch, 1, d_model)
        x = torch.cat((cls_tokens, x), dim=1) # (batch, seq_len + 1, d_model)
        
        # Positional encoding expects (seq_len, batch, d_model)
        x = x.transpose(0, 1)
        x = self.pos_encoder(x)
        x = x.transpose(0, 1) # back to (batch, seq_len+1, d_model)
        
        # Pass through layers manually to extract attention from the last layer
        # Note: nn.TransformerEncoderLayer forward signature doesn't easily return weights in all PyTorch versions.
        # But we can access self_attn if needed. For now, we will just use the standard forward
        # If we need exact attention weights, we have to bypass standard layer or use a custom one.
        # Let's use custom multihead attention call for the last layer to get weights.
        
        for i, layer in enumerate(self.layers):
            if i == len(self.layers) - 1:
                # To get attention weights from the last layer, we must call self_attn directly
                # This requires replicating the layer's internal logic for the final pass.
                # A simpler robust way in standard PyTorch is just passing through layer,
                # but we will extract it manually.
                
                # layer(src) does this internally:
                # src2, attn_weights = self.self_attn(src, src, src)
                # src = src + self.dropout1(src2)
                # src = self.norm1(src)
                # src2 = self.linear2(self.dropout(self.activation(self.linear1(src))))
                # src = src + self.dropout2(src2)
                # src = self.norm2(src)
                
                src_attn, attn_weights = layer.self_attn(x, x, x, need_weights=True)
                x = x + layer.dropout1(src_attn)
                x = layer.norm1(x)
                
                x2 = layer.linear2(layer.dropout(layer.activation(layer.linear1(x))))
                x = x + layer.dropout2(x2)
                x = layer.norm2(x)
            else:
                x = layer(x)
        
        # Take the [CLS] token representation (index 0) for forecasting
        cls_hidden = x[:, 0, :] # (batch, d_model)
        
        preds = self.regressor(cls_hidden) # (batch, output_dim)
        
        return preds, attn_weights
