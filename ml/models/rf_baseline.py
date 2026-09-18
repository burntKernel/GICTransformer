# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from sklearn.ensemble import RandomForestRegressor
# pyrefly: ignore [missing-import]
from sklearn.multioutput import MultiOutputRegressor
# pyrefly: ignore [missing-import]
import pandas as pd

def extract_rf_features(df_window: pd.DataFrame) -> np.ndarray:
    """
    Extracts flattened sequence statistics for Random Forest input.
    E.g., mean, max, min, std for each feature over the window.
    """
    means = df_window.mean().values
    maxs = df_window.max().values
    mins = df_window.min().values
    stds = df_window.std().values
    
    # Concatenate features
    features = np.concatenate([means, maxs, mins, stds])
    return features

class GICRandomForest:
    def __init__(self, n_estimators=100, max_depth=None, random_state=42):
        # We need MultiOutputRegressor because we predict Ex, Ey, E_mag
        self.model = MultiOutputRegressor(
            RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth, random_state=random_state)
        )
        
    def fit(self, X_train, y_train):
        """
        X_train: (num_samples, feature_dim) extracted statistics
        y_train: (num_samples, 3) targets
        """
        self.model.fit(X_train, y_train)
        
    def predict(self, X_test):
        return self.model.predict(X_test)
