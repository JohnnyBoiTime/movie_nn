Uses the MovieLens dataset to train the model, then uses TMDB api to get movie information (https://www.themoviedb.org/)

movie_rec_ui contains next.js

Everythinge else
is django

A movie recommendation web app that is powered by a pytorch neural network. 

The pre-trained model is launched on google cloud via a docker image and activates per request, so first request may take some time.

Features:

- Recommends movies along with their descriptions and a trailer to preview the movie.

![Demo](./assets/Movie_rec_demo.gif)

- Create a watched list of movies to keep track of what you have already watched.

![Demo](./assets/Watched_list_demo.gif)

- Save movies to watch in the future.

![Demo](./assets/Saving_movie_demo.gif)




