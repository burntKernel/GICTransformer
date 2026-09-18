import pandas as pd
# pyrefly: ignore [missing-import]
import numpy as np
import glob
import os
from datetime import datetime, timedelta

def load_intermagnet(folder_path):
    print("Loading INTERMAGNET data...")
    files = glob.glob(os.path.join(folder_path, '*.min'))
    
    dfs = []
    for file in sorted(files):
        print(f"Parsing {os.path.basename(file)}...")
        
        # Find the line where data starts
        skip_lines = 0
        with open(file, 'r') as f:
            for line in f:
                if line.startswith('DATE'):
                    break
                skip_lines += 1
                
        # Read the data
        # Columns in IAGA-2002: DATE, TIME, DOY, X, Y, Z, F (or G)
        df = pd.read_csv(file, sep='\s+', skiprows=skip_lines,
                         header=0, skipfooter=0, engine='python')
        
        # Create a proper datetime index
        # Format of DATE: YYYY-MM-DD, TIME: HH:MM:SS.000
        df['datetime'] = pd.to_datetime(df['DATE'] + ' ' + df['TIME'])
        df.set_index('datetime', inplace=True)
        
        # Drop columns we don't need for the time series alignment
        df.drop(columns=['DATE', 'TIME', 'DOY', '|'], errors='ignore', inplace=True)
        
        # Replace missing values (usually 99999.00 or 88888.00 in IAGA-2002)
        df.replace([99999.0, 99999.9, 99999.99, 88888.0, 88888.88], np.nan, inplace=True)
        
        dfs.append(df)
        
    merged_im_df = pd.concat(dfs).sort_index()
    # Remove duplicates if any overlap
    merged_im_df = merged_im_df[~merged_im_df.index.duplicated(keep='first')]
    return merged_im_df

def load_omni(file_path):
    print(f"Loading OMNI data from {os.path.basename(file_path)}...")
    # Read the fixed-width or whitespace separated OMNI file
    df = pd.read_csv(file_path, sep='\s+', header=None)
    
    # OMNI 1-min format columns (assuming standard subset requested):
    # 0: Year, 1: Day, 2: Hour, 3: Minute, 4: |B|, 5: Bx, 6: By, 7: Bz, etc.
    df.rename(columns={
        0: 'Year', 1: 'Day', 2: 'Hour', 3: 'Minute',
        4: 'IMF_B', 5: 'Bx', 6: 'By', 7: 'Bz',
        8: 'Flow_Pressure', 9: 'Speed', 10: 'Density'
    }, inplace=True)
    
    # Create datetime index from Year, DOY, Hour, Minute
    def row_to_datetime(row):
        # DOY is 1-indexed, so we subtract 1 day from the start of the year
        dt = datetime(int(row['Year']), 1, 1) + timedelta(days=int(row['Day']) - 1, 
                                                          hours=int(row['Hour']), 
                                                          minutes=int(row['Minute']))
        return dt

    df['datetime'] = df.apply(row_to_datetime, axis=1)
    df.set_index('datetime', inplace=True)
    df.drop(columns=['Year', 'Day', 'Hour', 'Minute'], inplace=True)
    
    # Replace standard OMNI missing values
    missing_vals = [99.99, 999.99, 9999.99, 99999.9, 99999.99]
    df.replace(missing_vals, np.nan, inplace=True)
    
    return df

def main():
    intermagnet_dir = os.path.join('data', 'raw', 'intermagnet')
    omni_file = os.path.join('data', 'raw', 'omni', 'omni_min_2015.lst')
    output_dir = os.path.join('data', 'processed')
    os.makedirs(output_dir, exist_ok=True)
    
    # Load and clean datasets
    df_im = load_intermagnet(intermagnet_dir)
    print(f"INTERMAGNET data shape: {df_im.shape}")
    
    df_omni = load_omni(omni_file)
    print(f"OMNI data shape: {df_omni.shape}")
    
    # Merge on the DatetimeIndex using an inner join
    print("Merging datasets...")
    df_merged = pd.merge(df_im, df_omni, left_index=True, right_index=True, how='inner')
    print(f"Merged dataset shape: {df_merged.shape}")
    
    # Save the output
    output_file = os.path.join(output_dir, 'gic_dataset_2015.csv')
    df_merged.to_csv(output_file)
    print(f"Successfully saved merged dataset to {output_file}")

if __name__ == '__main__':
    main()
