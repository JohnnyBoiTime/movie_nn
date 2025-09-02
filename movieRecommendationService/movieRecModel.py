import torch
import pickle
import pandas as pd
import os
import torch.nn.functional as F
from model import MovieRecModel

currentDirectory = os.path.dirname(os.path.abspath(__file__))

projectRoot = os.path.abspath(os.path.join(currentDirectory, os.pardir))

rawDataDirectory = os.path.join(projectRoot, "data", "rawData")

moviePicke = os.path.join(projectRoot, "data", "processed", "movieEncoder.pkl")
genrePickle = os.path.join(projectRoot, "data", "processed", "genreBinarizer.pkl")

trainedModel = os.path.join(projectRoot, "models", "movierec.pth")

movies = pd.read_csv(os.path.join(rawDataDirectory, "movies.csv"))

movieDF = pd.read_csv(os.path.join(projectRoot, "data", "processed", "processedMovies.csv"))

# Make it so user can simply type a string to get similar movies
movieIdToTitle = dict(zip(movieDF.movieId, movieDF.title))
titleToMovieId = dict(zip(movieDF.title, movieDF.movieId))

# Grab and load the pickles
with open(moviePicke, "rb") as f:
    movieEncoder = pickle.load(f)

with open(genrePickle, "rb") as f:
    genreLE = pickle.load(f)

movies["genreList"] = movies.genres.str.split("|")

# Turn saved binarizer into a one hot matrix
genreMatrix = genreLE.transform(movies["genreList"])

# get the movieIDs from the encoder 
# (Pretty much the models version  
# of the movies it understands)
classes = movieEncoder.classes_    

#  Lookup table to find the row where the movie is when given the movie ID
movieIdToRow = {movieID: i for i, movieID in enumerate(movieDF.movieId.values)}

#Find the row where the movie appears 
rowIndices = [movieIdToRow[movieID] for movieID in classes]
alignedGenres = genreMatrix[rowIndices, :]

# Makes sure the index in the genre matrix aligns 
# with the embeddings. 
# shape: [M (# of movies in model), G (# of genres)]
genreTensor = torch.from_numpy(alignedGenres).float()

#Turn the index into the corresponding movie
indexToMovie = {i: classes[i] for i in range(len(classes))}

device = torch.device("cpu")#"cuda" if torch.cuda.is_available() else "cpu") # check if GPU is available
model = MovieRecModel(numMovies=3650, numUsers = 610, numGenres = 20, HLSize=64, userMovieEmbedSize=32, genreEmbedSize=8).to(device) # Load it to GPU or CPU

# Load trained model
model.load_state_dict(torch.load(trainedModel, map_location=device))
model.eval()

movieEmbedds = model.movieEmbedding.weight.data.cpu()
movieEmbedds = F.normalize(movieEmbedds, dim=1)

# Test the model. (0.5-0.7 is a great range and indicates
# good similarity)
def recommendationSystemTest(movieTitle, movieYear, k=5):
    query = movieTitle + ' (' + movieYear + ')'

    # Make sure movie title is valid!
    if query not in titleToMovieId:
        raise KeyError("Movie does not exist in this model or incorrect input format")
    
    # convert title to its corresponding ID in the dictionary
    movieID = titleToMovieId[query]
    index = movieEncoder.transform([movieID])[0]
    if index is None:
        raise KeyError(f"Movie ID {movieTitle} is not in the pickle encoder")
    
    # It is confirmed to exist, now find similar movies!
    queryVector = movieEmbedds[index].unsqueeze(0).to(device)
    calcSimilarity = F.cosine_similarity(queryVector, movieEmbedds.to(device))

    # Because the similarity is between 0 and 1, -1 makes it so
    # the searched movie cannot appear
    # Comment out to make the movie appear, 
    # Uncomment to make the movie not appear
    # calcSimilarity[index] = -1.0 # Don't recommend the same movie.

    # Grab the one hot genre vector corresponding to
    # corresponding to the chosen movie 
    # Shape = [genre]
    genreQuery = genreTensor[index]

    # Find out how many movies have the same genres as the chosen movie.
    # 1 * 1 = 1 -> genre exists
    # 1 * 0 = 0 and 0 * 1 = 0 -> genre does not exist
    overlappingGenres = (genreTensor * genreQuery).sum(dim=1)

    # Build mask that exists if a movie is found that has
    # the same genres as the chosen movie
    sharedMasking = overlappingGenres > 2

    # Filter out movies that do not share the genres if the
    # chosen movie

    # Makes it so we ignore all movies with less than 2 genres!
    calcSimilarity[~sharedMasking] = -1.0

    # Get the top k movies
    topKValues, topKIndexes = torch.topk(calcSimilarity, k)

    # We found the similar movies
    return [( movieIdToTitle.get(indexToMovie[index.item()]), topKValues[j].item())
        for j, index in enumerate(topKIndexes)]


