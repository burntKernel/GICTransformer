import os
import pandas as pd
import sys

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data.preprocessing import preprocess_data

def merge_all_datasets():
    print("Loading existing base dataset (OMNI + SuperMAG)...")
    base_df = pd.read_csv("data/processed/gic_dataset_2015.csv", index_col=0, parse_dates=True)
    
    print("Loading GOES X-Ray Flux...")
    goes_df = pd.read_csv("../data/raw/goes/goes_2015_2015.csv", index_col=0, parse_dates=True)
    
    print("Loading AE Indices...")
    ae_df = pd.read_csv("../data/raw/ae/ae_2015_2015.csv", index_col=0, parse_dates=True)
    
    print("Loading DSCOVR Solar Wind...")
    dscovr_df = pd.read_csv("../data/raw/dscovr/dscovr_2015_2015.csv", index_col=0, parse_dates=True)
    
    print("Merging datasets using dynamic preprocessing engine...")
    # Note: Our updated preprocess_data uses an outer join. 
    # Since base_df is already joined, we can pass it as omni_df and pass empty for smag_df.
    empty_df = pd.DataFrame(index=base_df.index)
    merged_df = preprocess_data(base_df, empty_df, dscovr_df, goes_df, ae_df)
    
    out_path = "data/processed/gic_dataset_2015_advanced.csv"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    merged_df.to_csv(out_path)
    print(f"Successfully merged all advanced datasets! Saved to {out_path}")

if __name__ == "__main__":
    merge_all_datasets()
