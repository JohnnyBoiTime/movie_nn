import pandas as pd
import os
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# Load data sets from the ml csv
ratings = pd.read_csv('./data/rawData/ratings.csv')
movies = pd.read_csv('./data/rawData/movies.csv')

# drop dupes
ratings = ratings.drop_duplicates(subset=['userId', "movieId"])

# Filter our users with very few ratings, insignificant
numUsers = ratings.userId.value_counts()
numMovies = ratings.movieId.value_counts()

# Keep users and movies that have at least 5 ratings
signifUsers = numUsers[numUsers >= 5].index
signifMovies = numMovies[numMovies >= 5].index

# Filter out the ratings so they only keep the users of our choosing
ratings = (
    ratings[ratings.userId.isin(signifUsers) & 
            ratings.movieId.isin(signifMovies)]
)

# LabelEncoder converts the categorical labels into integers
userLabels = LabelEncoder()
movieLabels = LabelEncoder()

# We then fit the labels to the users and movie IDs
ratings["userIndex"] = userLabels.fit_transform(ratings.userId)
ratings["movieIndex"] = movieLabels.fit_transform(ratings.movieId)

# Count unique indeces for the users and movies
users = ratings.userIndex.nunique()
movies = ratings.movieIndex.nunique()

# split data into training and testing sets
# 0.2 = 20% data will be put into testing, 80% put in training
# 42 = random seed so we get same split
trainingDataFrame, testingDataFrame = train_test_split(
    ratings, test_size=0.2, random_state=42
)

# splits data into training data and validation data
# 0.1 = 10% data will be put into validation, 90% put in training/fitting
# 42 = random seed so we get same split
trainingDataFrame, validationDataFrame = train_test_split(
    trainingDataFrame, test_size=0.1, random_state =42
)

# Save processed data to csv files:
trainingDataFrame.to_csv(os.path.join("data", "processed", "training.csv"), index=False)
validationDataFrame.to_csv(os.path.join("data", "processed", "validation.csv"), index=False)
testingDataFrame.to_csv(os.path.join("data", "processed", "testing.csv"), index=False)

# Save label encoders
with open(os.path.join("data", "processed", "userEncoder.pkl"), "wb") as f:
    pickle.dump(userLabels, f)

with open(os.path.join("data", "processed", "movieEncoder.pkl"), "wb") as f:
    pickle.dump(movieLabels, f)
