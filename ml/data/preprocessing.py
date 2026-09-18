# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
import pandas as pd
# pyrefly: ignore [missing-import]
from typing import Tuple

def preprocess_data(omni_df: pd.DataFrame, smag_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aligns, interpolates, and standardizes data.
    """
    # 1. Align timestamps (outer join)
    merged_df = omni_df.join(smag_df, how='outer')
    
    # 2. Interpolate small gaps (e.g., up to 5 minutes)
    merged_df = merged_df.interpolate(method='linear', limit=5)
    
    # 3. Drop remaining NaNs (large gaps)
    merged_df = merged_df.dropna()
    
    return merged_df

def robust_z_score(df: pd.DataFrame, columns: list) -> pd.DataFrame:
    """
    Applies robust z-score standardization using median and IQR.
    """
    for col in columns:
        median = df[col].median()
        q75, q25 = np.percentile(df[col], [75, 25])
        iqr = q75 - q25
        df[col] = (df[col] - median) / (iqr + 1e-8)
    return df
