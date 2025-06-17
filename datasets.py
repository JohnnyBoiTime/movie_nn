import pandas as pd
import torch
from torch.utils.data import Dataset

# Turn indexes into tensors
class RatingsDataset(Dataset):

    # read csv
    def __init__(self, csvPath):
        self.df = pd.read_csv(csvPath)

    # Get length of dataset
    def __len__(self):
        return len(self.df)
    
    # Turn into tensors
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        return (
            torch.tensor(int(row.userIndex), dtype=torch.long),
            torch.tensor(int(row.movieIndex), dtype=torch.long),
            torch.tensor(row.rating, dtype=torch.float),
        )
            