import pandas as pd
import os
import pickle
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from sklearn.model_selection import train_test_split

# Find where this script lies:
scriptDirectory = os.path.dirname(os.path.abspath(__file__))
projectRoot = os.path.abspath(os.path.join(scriptDirectory, os.pardir))

# Find out where the raw data and processed data live
rawDataDirectory = os.path.join(projectRoot, "data", "rawData")
processedDataDirectory = os.path.join(projectRoot, "data", "processed")

# Load data sets from the ml csv
ratings = pd.read_csv(os.path.join(rawDataDirectory, "ratings.csv"))
moviesDataFrame = pd.read_csv(os.path.join(rawDataDirectory, "movies.csv"))

# Make it so stuff like Matrix, The -> The Matrix
def standardizeTitles(title):
    if ',' in title:
        mainTitle, article = [s.strip() for s in title.rsplit(',' , 1) ]
        if article.lower().startswith("the") or article.lower().startswith("a") or article.lower().startswith("an"):
           return f"{article.title().split(" ")[0].lower()} {mainTitle.lower()} {article.title().split(" ")[1]}"

    return title.lower()

moviesDataFrame['title'] = moviesDataFrame['title'].apply(standardizeTitles)

# drop dupes
ratings = ratings.drop_duplicates(subset=['userId', "movieId"])

# Split the genres into lists
moviesDataFrame["genreList"] = moviesDataFrame.genres.str.split("|")

# Make sets of labels for the genres. Basically:
# 1 = genre is for the specific movie
# 0 = genre is NOT for the specific movie
genreBinarizer = MultiLabelBinarizer()
genreMatrix = genreBinarizer.fit_transform(moviesDataFrame["genreList"])

# Map the genres back into their respective movies
for index, genre in enumerate(genreBinarizer.classes_):
    moviesDataFrame[genre] = genreMatrix[:, index]

# Get number of things to use in the network later
numUsers = ratings.userId.value_counts()
numMovies = ratings.movieId.value_counts()
numGenres = genreMatrix.shape[1]

# Keep users and movies that have at least 5 ratings,
# this is so the network considers the "significant"
# data and ignores smaller, more insignificate data
# that may not do much for the network and may
# just bog it down. 
signifUsers = numUsers[numUsers >= 5].index
signifMovies = numMovies[numMovies >= 5].index

# Filter out the ratings so they only keep the users of our choosing
ratings = (
    ratings[ratings.userId.isin(signifUsers) & 
            ratings.movieId.isin(signifMovies)]
)

# Make it so there are no gaps in between the userId's and 
# movie IDs. Create encoder, fit the size to input indices,
# and count them.
# Example -> userIds = [1, 6, 9, 10, 142 , 163]
# There are plenty of gaps [1-6], [10-142], so we simply
# do this so we have unique userIds = [1,2,3,4,5,6] so there are no gaps. 
# This ensures that when we embed information later,
# we have simple indices from 0-n-1 (with n being the number of unique movies/users),
# Which embedded layers need/require.
userLabels = LabelEncoder()
movieLabels = LabelEncoder()
ratings["userIndex"] = userLabels.fit_transform(ratings.userId)
ratings["movieIndex"] = movieLabels.fit_transform(ratings.movieId)
numUsers = ratings.userIndex.nunique()
numMovies = ratings.movieIndex.nunique()

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
trainingDataFrame.to_csv(os.path.join(processedDataDirectory, "training.csv"), index=False)
validationDataFrame.to_csv(os.path.join(processedDataDirectory, "validation.csv"), index=False)
testingDataFrame.to_csv(os.path.join(processedDataDirectory, "testing.csv"), index=False)
moviesDataFrame[
    ["movieId", "title"] + list(genreBinarizer.classes_)
].to_csv(os.path.join(processedDataDirectory, "processedMovies.csv"), index=False)    

# .pkl saves the encoders so we have them indefinitely. They reference
# the labels we have just created so we always have them to use later.
with open(os.path.join(processedDataDirectory, "userEncoder.pkl"), "wb") as f:
    pickle.dump(userLabels, f)

with open(os.path.join(processedDataDirectory, "movieEncoder.pkl"), "wb") as f:
    pickle.dump(movieLabels, f)

# Save the genre binarizer for later training
with open(os.path.join(processedDataDirectory, "genreBinarizer.pkl"), "wb") as f:    
    pickle.dump(genreBinarizer, f)

# Need for later
print(f"Number of users: {numUsers}, number of movies:{numMovies}, number of genres: {numGenres}")
