Uses the MovieLens dataset to train the model
Uses TMDB api to get movie information (https://www.themoviedb.org/)

movie_rec_ui contains next.js

Everythinge else
is django

A movie recommendation web app that is powered by a pytorch neural network. 

The pre-trained model is launched on google cloud via a docker image and activates per request, so first request may take some time.

Features:
- Log in to save movies or create a watched list
- Can go in as guest to get recommendations, but need a login to save movies and create the watched movies
- Movie recommendation gives description of movie and a trailer (courtesy of TMDB api)

![Demo](./assets/skipPrevious.gif)
![Demo](./assets/hideShowMusicPlayer.gif)

- Generate albums to play in app simply by placing an album folder with songs into assets and running node GenerateAlbums.js

![Demo](./assets/switchingAlbums.gif)
  
- Search through songs

![Demo](./assets/searching.gif)

- Make playlists

![Demo](./assets/playlists.gif)
  
- Go to an artists page to see all their songs and albums

![Demo](./assets/artistPage.gif)

Uses:
- React Redux and useContext, although redux is more heavily used
- React native elements for UI
- Various expo libraries for audio and sending files to device
- AsyncStorage
- React navigation
- Amazon AWS for backend (not completed or optimized but is ready to link)

