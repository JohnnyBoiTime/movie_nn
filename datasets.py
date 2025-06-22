import pandas as pd, pickle
import torch
from torch.utils.data import Dataset

# Turn indexes into tensors
class RatingsDataset(Dataset):


    # read csv
    def __init__(self, ratingsCSV, moviesCSV, userPickle, moviePickle, genrePickle):

        # Get info from the csvs for later
        self.ratingsDataFrame = pd.read_csv(ratingsCSV)
        self.moviesDataFrame = pd.read_csv(moviesCSV)

        # Grab the serialized information for the genres, user ratings, and movies
        with open(genrePickle, "rb") as file:
            self.genreLE = pickle.load(file)

        with open(userPickle, "rb") as file:
            self.userLE = pickle.load(file)

        with open(moviePickle, "rb") as file:
            self.movieLE = pickle.load(file)

        # Map the human understandable information to what the network understands
        self.ratingsDataFrame["userIndex"] = self.userLE.transform(self.ratingsDataFrame.userId)
        self.ratingsDataFrame["movieIndex"] = self.movieLE.transform(self.ratingsDataFrame.movieId)

        # Merge the movies, ratings, and genres into one dataframe
        combinedDF = self.ratingsDataFrame.merge(self.moviesDataFrame, on="movieId", how="left")

        # Tensorize the pickled information to insert into the network
        self.userIndex = torch.tensor(combinedDF.userIndex.values, dtype=torch.long)
        self.movieIndex = torch.tensor(combinedDF.movieIndex.values, dtype=torch.long)
        self.ratings = torch.tensor(combinedDF.rating.values, dtype=torch.float)
        genreColumns = list(self.genreLE.classes_)
        self.genreValues = torch.tensor(combinedDF[genreColumns].values, dtype=torch.float)
        

    # Get length of dataset
    def __len__(self):
        return len(self.ratings)
    
    # Turn into tensors
    def __getitem__(self, idx):
        return (
            self.userIndex[idx],
            self.movieIndex[idx],
            self.ratings[idx],
            self.genreValues[idx]
        )
            