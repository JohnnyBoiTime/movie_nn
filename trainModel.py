import torch
from torch import nn, optim
from torch.utils.data import DataLoader
from datasets import RatingsDataset
from model import MovieRecModel

# Create data sets from the csv's
trainingDataset = RatingsDataset("data/processed/training.csv")
validationDataset = RatingsDataset("data/processed/validation.csv")
testDataset = RatingsDataset("data/processed/testing.csv")

# Loads them up
traningLoader = DataLoader(trainingDataset, batch_size=512, shuffle=True, num_workers=4)
validationLoader = DataLoader(validationDataset, batch_size=512, shuffle=True, num_workers=4)
testingLoader = DataLoader(testDataset, batch_size=512, shuffle=True, num_workers=4)

gpuFound = torch.device("cuda" if torch.cuda.is_available() else "cpu")
