import torch
from torch import nn, optim
from torch.utils.data import DataLoader
from datasets import RatingsDataset
from model import MovieRecModel


def main(): 
    # Create data sets from the csv's
    trainingDataset = RatingsDataset("data/processed/training.csv", "data/processed/processedMovies.csv")
    validationDataset = RatingsDataset("data/processed/validation.csv", "data/processed/processedMovies.csv")
    testDataset = RatingsDataset("data/processed/testing.csv", "data/processed/processedMovies.csv")

    # Loads them up. Shuffle training for randomness, but we need validation and testing to be more concrete
    # and deterministic
    trainingLoader = DataLoader(trainingDataset, batch_size=512, shuffle=True, num_workers=4)
    validationLoader = DataLoader(validationDataset, batch_size=512, shuffle=False, num_workers=4)
    testingLoader = DataLoader(testDataset, batch_size=512, shuffle=False, num_workers=4)

    gpuFound = torch.device("cuda" if torch.cuda.is_available() else "cpu") # check if GPU is available
    model = MovieRecModel(numMovies=3650, numUsers = 610, numGenres = 20, HLSize=64, embeddingSize=32, dropout=0.5).to(gpuFound) # train on GPU, default CPU

    # calc loss and also optimze using the learning rate, low learning rate for slower learning
    calcLoss = nn.MSELoss()
    optimizeNetwork = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-5)

    # How many times we want to go through the network
    numberEpochs = 10

    # Go through the network!
    for epoch in range(1, numberEpochs + 1):

        # Train the model
        model.train()
        totalTrainingLoss = 0.0

        # Put users, movies, and ratings through the network
        for users, movies, ratings, genres in trainingLoader:
            # Use GPU or CPU
            users, movies, ratings, genres = (
                users.to(gpuFound),
                movies.to(gpuFound),
                ratings.to(gpuFound),
                genres.to(gpuFound)
            )

            # Zero old gradients, take networks output,
            # then compute loss
            optimizeNetwork.zero_grad()
            output = model(users, movies, genres)
            loss = calcLoss(output, ratings)

            # Backward pass and configure weights
            loss.backward()

            nn.utils.clip_grad_norm_(model.parameters(), 5)
            
            optimizeNetwork.step()

            # Loss for the epoch
            totalTrainingLoss += loss.item() * users.size(0)

        averageTrainingLossD = totalTrainingLoss / len(trainingDataset)
        trainingRMSED = averageTrainingLossD ** 0.5

        
        model.eval()
        newTotalTrainingLoss = 0.0
        with torch.no_grad():
              for users, movies, ratings, genres in trainingLoader:
                 # Use GPU or CPU
                users, movies, ratings, genres = (
                    users.to(gpuFound),
                    movies.to(gpuFound),
                    ratings.to(gpuFound),
                    genres.to(gpuFound)
            )

                output = model(users, movies, genres)
                newTotalTrainingLoss += calcLoss(output, ratings).item() * users.size(0)
        
        # calc RMSE/how well our model memorizes the data set
        averageTrainingLoss = newTotalTrainingLoss / len(trainingDataset)
        trainingRMSE = averageTrainingLoss ** 0.5

        totalValidationLoss = 0
        with torch.no_grad():
            for users, movies, ratings, genres in validationLoader:
                 # Use GPU or CPU
                users, movies, ratings, genres = (
                    users.to(gpuFound),
                    movies.to(gpuFound),
                    ratings.to(gpuFound),
                    genres.to(gpuFound)
            )

                output = model(users, movies, genres)
                totalValidationLoss += calcLoss(output, ratings).item() * users.size(0)

        # Calc how well it MAY DO on unseen data
        averageValidationLoss = totalValidationLoss / len(validationDataset)
        validationRMSE = averageValidationLoss ** 0.5

        print(f"Current epoch: {epoch} training RMSE={trainingRMSE:.4f}, trainingDROPOUT = {trainingRMSED:.4f}, validation RMSE={validationRMSE:.4f}")

    # Now, we do testing!
    model.eval()
    totalTestingLoss = 0.0
    with torch.no_grad():
        for users, movies, ratings, genres in testingLoader:
            users, movies, ratings, genres = (
                users.to(gpuFound),
                movies.to(gpuFound),
                ratings.to(gpuFound),
                genres.to(gpuFound)
            )

            output = model(users, movies, genres)
            totalTestingLoss += calcLoss(output, ratings).item() * users.size(0)

    # Calc how well it does on data not seen
    averageTestingLoss = totalTestingLoss / len(testDataset)
    testingRMSE = averageTestingLoss ** 0.5

    print(f"testing RMSE = {testingRMSE:.4f}")

    # Save the model to use!
    torch.save(model.state_dict(), "models/movierec.pth")

    print(f"Finished!")

# Windows so yeah
if __name__ == "__main__":
    main()