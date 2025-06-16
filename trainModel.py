import torch
from torch import nn, optim
from torch.utils.data import DataLoader
from datasets import RatingsDataset
from model import MovieRecModel

# Create data sets from the csv's
trainingDataset = RatingsDataset("data/processed/training.csv")
validationDataset = RatingsDataset("data/processed/validation.csv")
testDataset = RatingsDataset("data/processed/testing.csv")

# Loads them up. Shuffle training for randomness, but we need validation and testing to be more concrete
# and deterministic
trainingLoader = DataLoader(trainingDataset, batch_size=512, shuffle=True, num_workers=4)
validationLoader = DataLoader(validationDataset, batch_size=512, shuffle=False, num_workers=4)
testingLoader = DataLoader(testDataset, batch_size=512, shuffle=False, num_workers=4)

gpuFound = torch.device("cuda" if torch.cuda.is_available() else "cpu") # check if GPU is available
model = MovieRecModel(numMovies=3650, numUsers = 610, embeddingSize=50).to(gpuFound) # train on GPU, default CPU

# calc loss and also optimze using the learning rate, low learning rate for slower learning
calcLoss = nn.MSELoss()
optimizeNetwork = optim.Adam(model.parameters(), lr=1e-3)

# How many times we want to go through the network
numberEpochs = 10

# Go through the network!
for epoch in range(1, numberEpochs + 1):
    model.train()
    totalTrainingLoss = 0.0

    # Put users, movies, and ratings through the network
    for users, movies, ratings in trainingLoader:

        # Use GPU or CPU
        users, movies, ratings = (
            users.to(gpuFound),
            movies.to(gpuFound),
            ratings.to(gpuFound)
        )

        # Zero old gradients, take networks output,
        # then compute loss
        optimizeNetwork.zero_grad()
        output = model(users, movies)
        loss = calcLoss(output, ratings)

        # Backward pass and configure weights
        loss.backward()
        optimizeNetwork.step()

        # Loss for the epoch
        totalTrainingLoss += loss.item() * users.size(0)

    averageTrainingLoss = totalTrainingLoss / len(trainingDataset)
    trainingRMSE = averageTrainingLoss ** 0.5
    print(f"Current epoch: {epoch}, RMSE = {trainingRMSE:.4f}")

torch.save(model.state_dict(), "models/movierec.pth")
