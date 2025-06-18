import torch
import pickle
import pandas as pd
import os
import torch.nn.functional as F
from model import MovieRecModel

currentDirectory = os.path.dirname(os.path.abspath(__file__))

projectRoot = os.path.abspath(os.path.join(currentDirectory, os.pardir))

rawDataDirectory = os.path.join(projectRoot, "data", "rawData")

pickleDirectory = os.path.join(projectRoot, "data", "processed", "movieEncoder.pkl")

trainedModel = os.path.join(projectRoot, "models", "movierec.pth")

movies = pd.read_csv(os.path.join(rawDataDirectory, "movies.csv"))

# Make it so user can simply type a string to get similar movies
movieIdToTitle = dict(zip(movies.movieId, movies.title))
titleToMovieId = dict(zip(movies.title, movies.movieId))

# Grab and load the pickle
with open(pickleDirectory, "rb") as f:
    movieEncoder = pickle.load(f)

# get the indexes from the encoder
classes = movieEncoder.classes_    
indexToMovie = {i: classes[i] for i in range(len(classes))}

# params set for model
numUsers = 610
numMovies = len(classes)
embeddingSize = 50


gpuFound = torch.device("cuda" if torch.cuda.is_available() else "cpu") # check if GPU is available
model = MovieRecModel(numUsers, numMovies, embeddingSize).to(gpuFound) # Load it to GPU or CPU

# Load trained model
model.load_state_dict(torch.load(trainedModel, map_location=gpuFound))
model.eval()

movieEmbedds = model.movieEmbedding.weight.data.cpu()

# Test the model
def recommendationSystemTest(movieTitle, k=5):
    year = str(input("What year did the movie come out? "))
    query = movieTitle + ' (' + year + ')'
    print(query)

    # Make sure movie title is valid!
    if query not in titleToMovieId:
        raise KeyError("Movie does not exist in this model or incorrect input format")
    
    # convert title to its corresponding ID in the dictionary
    movieID = titleToMovieId.get(query)
    index = classes[movieID]
    if index is None:
        raise KeyError(f"Movie ID {movieTitle} is not in the pickle encoder")
    
    # It is confirmed to exist, now find similar movies!
    queryVector = movieEmbedds[index].unsqueeze(0)
    calcSimilarity = F.cosine_similarity(queryVector, movieEmbedds)
    calcSimilarity[index] = -1.0 # Don't recommend the same movie
    topKValues, topKIndexes = torch.topk(calcSimilarity, k)

    # We found the simular movies
    return [(movieIdToTitle.get(indexToMovie[index.item()]), topKValues[j].item())
        for j, index in enumerate(topKIndexes)]


