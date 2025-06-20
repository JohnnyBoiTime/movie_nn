from movie_nn.recommendation import recommendationSystemTest

if __name__ == "__main__":

    # From the name of the movie + year, find similar movies contained in the model
    movieTitle = str(input("Enter a movie (example: Heat (1995) ): "))
    recommendedMovie = recommendationSystemTest(movieTitle, k=10)
    print("Top 10 Similar movies: ")
    for movie, score in recommendedMovie:
        print(f"Movie {movie} (sim={score:.3f})")