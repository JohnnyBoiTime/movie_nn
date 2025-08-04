import torch
import os
from torch import nn, optim
from torch.utils.data import DataLoader
from datasets import RatingsDataset
from model import MovieRecModel


def main(): 

    currentDirectory = os.path.dirname(os.path.abspath(__file__))

    projectRoot = os.path.abspath(os.path.join(currentDirectory, os.pardir))

    userPickle = os.path.join(projectRoot, "movie_nn", "data", "processed", "userEncoder.pkl")
    moviePickle = os.path.join(projectRoot, "movie_nn", "data", "processed", "movieEncoder.pkl")
    genrePickle = os.path.join(projectRoot, "movie_nn", "data", "processed", "genreBinarizer.pkl")

    # Create data sets from the csv's
    trainingDataset = RatingsDataset("data/processed/training.csv", 
                                        "data/processed/processedMovies.csv",
                                        userPickle,
                                        moviePickle,
                                        genrePickle
                                        )
    validationDataset = RatingsDataset("data/processed/validation.csv", 
                                        "data/processed/processedMovies.csv",
                                        userPickle,
                                        moviePickle,
                                        genrePickle
                                        )
    testDataset = RatingsDataset("data/processed/testing.csv", 
                                        "data/processed/processedMovies.csv",
                                         userPickle,
                                         moviePickle,
                                         genrePickle
                                         )

    # Loads them up. Shuffle training for randomness, but we need validation and testing to be more concrete
    # and deterministic
    trainingLoader = DataLoader(trainingDataset, batch_size=512, shuffle=True, num_workers=4)
    validationLoader = DataLoader(validationDataset, batch_size=512, shuffle=False, num_workers=4)
    testingLoader = DataLoader(testDataset, batch_size=512, shuffle=False, num_workers=4)

    numUsersFound = len(trainingDataset.userLE.classes_)
    numMoviesFound = len(trainingDataset.movieLE.classes_)
    numGenresFound = len(trainingDataset.genreLE.classes_)

    print(numUsersFound, numMoviesFound, numGenresFound)


    device = torch.device("cuda" if torch.cuda.is_available() else "cpu") # check if GPU is available
    model = MovieRecModel(numMovies=numMoviesFound, numUsers = numUsersFound, numGenres = numGenresFound, HLSize=64, userMovieEmbedSize=32, genreEmbedSize=8).to(device) # train on GPU, default CPU

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
                users.to(device),
                movies.to(device),
                ratings.to(device),
                genres.to(device)
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

        averageTrainingLoss = totalTrainingLoss / len(trainingDataset)
        trainingRMSE = averageTrainingLoss ** 0.5

        """
        # Evaluate the model!
        model.eval()
        newTotalTrainingLoss = 0.0
        with torch.no_grad():
              for users, movies, ratings, genres in trainingLoader:
                 # Use GPU or CPU
                users, movies, ratings, genres = (
                    users.to(device),
                    movies.to(device),
                    ratings.to(device),
                    genres.to(device)
            )

                output = model(users, movies, genres)
                newTotalTrainingLoss += calcLoss(output, ratings).item() * users.size(0)
        
        # calc RMSE/how well our model memorizes the data set
        averageTrainingLoss = newTotalTrainingLoss / len(trainingDataset)
        trainingRMSE = averageTrainingLoss ** 0.5

        """
        model.eval()
        totalValidationLoss = 0
        with torch.no_grad():
            for users, movies, ratings, genres in validationLoader:
                 # Use GPU or CPU
                users, movies, ratings, genres = (
                    users.to(device),
                    movies.to(device),
                    ratings.to(device),
                    genres.to(device),
                )

                output = model(users, movies, genres)
                totalValidationLoss += calcLoss(output, ratings).item() * users.size(0)

        # Calc how well it MAY DO on unseen data
        averageValidationLoss = totalValidationLoss / len(validationDataset)
        validationRMSE = averageValidationLoss ** 0.5

        print(f"Current epoch: {epoch} training RMSE={trainingRMSE:.4f}, validation RMSE={validationRMSE:.4f}")

    # Now, we do testing!
    model.eval()
    totalTestingLoss = 0.0
    with torch.no_grad():
        for users, movies, ratings, genres in testingLoader:
            users, movies, ratings, genres = (
                users.to(device),
                movies.to(device),
                ratings.to(device),
                genres.to(device)
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