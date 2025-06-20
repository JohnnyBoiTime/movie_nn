import pandas as pd
import torch
from torch.utils.data import Dataset

# Turn indexes into tensors
class RatingsDataset(Dataset):

    # read csv
    def __init__(self, ratingsCSV, moviesCSV):
        ratingsDataFrame = pd.read_csv(ratingsCSV)
        moviesDataFrame = pd.read_csv(moviesCSV)

        ratingsDataFrame = ratingsDataFrame.merge(moviesDataFrame, on="movieId", how="left")

        print("ALL COLUMNS:", ratingsDataFrame.columns.to_list())

        genres = [column for column in ratingsDataFrame.columns if column not in 
                 {"userId", "movieId", "rating", "timestamp", "userIndex", "movieIndex", "title"}
                ]

        # Now, assign!
        self.userIndex = torch.tensor(ratingsDataFrame.userIndex.values, dtype=torch.long)
        self.movieIndex = torch.tensor(ratingsDataFrame.movieIndex.values, dtype=torch.long)
        self.ratings = torch.tensor(ratingsDataFrame.rating.values, dtype=torch.float)
        self.genres = torch.tensor(ratingsDataFrame[genres].values, dtype=torch.float)

    # Get length of dataset
    def __len__(self):
        return len(self.ratings)
    
    # Turn into tensors
    def __getitem__(self, idx):
        return (
            self.userIndex[idx],
            self.movieIndex[idx],
            self.ratings[idx],
            self.genres[idx]
        )
            