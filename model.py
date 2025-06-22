import torch
import torch.nn as nn
import torch.nn.functional as F

# basic neural network model for movie recommendations

# inherits attributes from nn.Module
class MovieRecModel(nn.Module):
    def __init__(self, numUsers, numMovies, numGenres, HLSize=64,  userMovieEmbedSize=32, 
                 genreEmbedSize=8): #, dropout=0.5):
        super().__init__() # initialize parent class attributes first

        # Embedding users + movies
        self.userEmbedding = nn.Embedding(numUsers, userMovieEmbedSize)
        self.movieEmbedding = nn.Embedding(numMovies, userMovieEmbedSize)

        # Embedding biases for the users and movies
        self.userBiases = nn.Embedding(numUsers, 1)
        self.movieBiases = nn.Embedding(numMovies, 1)
        self.bias = nn.Parameter(torch.zeros(1)) # Global bias

        # Constructing the network
        self.genreLinear = nn.Linear(numGenres, genreEmbedSize)
        self.fullyConnectedLayer1 = nn.Linear(userMovieEmbedSize * 2 + genreEmbedSize, HLSize)
        self.fullyConnectedLayer2 = nn.Linear(HLSize, 1)
      #  self.drop = nn.Dropout(dropout)


    # forward pass
    # OH = one hot
    def forward(self, userOH, moveOH, genreOH):

        # Look up the users, movies, and genres
        userEmbeds = self.userEmbedding(userOH)
        movieEmbeds = self.movieEmbedding(moveOH)
        genreEmbeds = F.relu(self.genreLinear(genreOH))

        # Get the biases
        userBias = self.userBiases(userOH).squeeze(1)
        movieBias = self.movieBiases(moveOH).squeeze(1)

        # Compute the dot product
        dotProduct = (userEmbeds * movieEmbeds).sum(dim = 1)

        # go through network! Learn from non linear interactions
        x = torch.cat([userEmbeds, movieEmbeds, genreEmbeds], dim=1)
        x = F.relu(self.fullyConnectedLayer1(x))
        multiLayerPerceptron = self.fullyConnectedLayer2(x).squeeze(1)


        # Return output 
        return dotProduct + multiLayerPerceptron + userBias + movieBias + self.bias
