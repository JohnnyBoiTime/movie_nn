import torch
import torch.nn as nn
import torch.nn.functional as F

# basic neural network model for movie recommendations

# inherits attributes from nn.Module
class MovieRecModel(nn.Module):
    def __init__(self, numUsers, numMovies, numGenres, HLSize=64,  embeddingSize=32, dropout=0.5):
        super().__init__() # initialize parent class attributes first

        # Embedding users + movies
        self.userEmbedding = nn.Embedding(numUsers, embeddingSize)
        self.movieEmbedding = nn.Embedding(numMovies, embeddingSize)

        # Embedding biases for the users and movies
        self.userBiases = nn.Embedding(numUsers, 1)
        self.movieBiases = nn.Embedding(numMovies, 1)
        self.bias = nn.Parameter(torch.zeros(1)) # Global bias

        # Constructing the network
        self.genreLinear = nn.Linear(numGenres, embeddingSize)
        self.fullyConnectedLayer1 = nn.Linear(embeddingSize * 3, HLSize)
        self.fullyConnectedLayer2 = nn.Linear(HLSize, 1)
        self.drop = nn.Dropout(dropout)


    # forward pass
    def forward(self, userIndices, movieIndices, genreIndeces):

        # Look up the users, movies, and genres
        userEmbeds = self.userEmbedding(userIndices)
        movieEmbeds = self.movieEmbedding(movieIndices)
        genreEmbeds = self.genreLinear(genreIndeces)

        # Get the biases
        userBias = self.userBiases(userIndices).squeeze(1)
        movieBias = self.movieBiases(movieIndices).squeeze(1)

        # Compute the dot product
        dotProduct = (userEmbeds * movieEmbeds).sum(dim = 1)

        # go through network! Learn from non linear interactions
        x = torch.cat([userEmbeds, movieEmbeds, genreEmbeds], dim=1)
        x = self.drop(F.relu(self.fullyConnectedLayer1(x)))
        multiLayerPerceptron = self.fullyConnectedLayer2(x).squeeze(1)


        # Return output 
        return dotProduct + multiLayerPerceptron + userBias + movieBias + self.bias
