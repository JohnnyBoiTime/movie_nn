import torch.nn as nn

# basic neural network model for movie recommendations

# inherits attributes from nn.Module
class MovieRecModel(nn.Module):
    def __init__(self, numUsers, numMovies, embeddingSize=50):
        super().__init__() # initialize parent class attributes first
        self.userEmbedding = nn.Embedding(numUsers, embeddingSize)
        self.movieEmbegging = nn.Embedding(numMobies, embeddingSize)

    # forward pass
    def forward(self, userIndices, movieIndices):
        userEmbeds = self.userEmbedding(userIndices)
        movieEmbeds = self.movieEmbegging(movieIndices)
        return (userEmbeds * movieEmbeds).sum(dim = 1)
