from django.db import models
from django.conf import settings

# Create your models here.

# Format of movie
class Movie(models.Model):
    tmdb_id = models.PositiveIntegerField(unique=True, db_index=True) # Unique id to prevent repeat saves
    title = models.CharField(max_length=90)
    # Allowing null and blank values are not necassary in this case,
    # year, movie_poster_url, and description should all be required. 
    year = models.PositiveIntegerField(null=True, blank=True)
    movie_poster_url = models.URLField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

# Format of watched movie, pretty much the same as above
class WatchedMovie(models.Model):
    tmdb_id = models.PositiveIntegerField(unique=True, db_index=True) # Unique id to prevent repeat saves
    title = models.CharField(max_length=90)
    year = models.PositiveIntegerField(null=True, blank=True)
    movie_poster_url = models.URLField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

 # For creating the list of saved movies for the user
class SavedMovies(models.Model):
    # Seeing what specific movies a user has saved
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_movies')

    # For seeing how popular a movie is (Could be a cool mnetric)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='saved_by') 
    added_at = models.DateTimeField(auto_now_add=True)

    # Options 
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "movie"], name="unique_user_movies_saved"),
        ]
        indexes = [models.Index(fields=["user", "added_at"])]

# For creating a list of already watched movies
class WatchedMovies(models.Model):
    # Seeing what specific movies a user has saved
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='watched_movies')

    # For seeing how popular a movie is (Could be a cool mnetric)
    movie = models.ForeignKey(WatchedMovie, on_delete=models.CASCADE, related_name='watched_by') 
    added_at = models.DateTimeField(auto_now_add=True)

    # Options 
    class Meta:

        # Makes it so the user can only have 1 unique user and movie
        constraints = [
            models.UniqueConstraint(fields=["user", "movie"], name="unique_user_movies_watched"),
        ]

        # Fastor lookups, optional but makes things faster with more data so why not add it?
        indexes = [models.Index(fields=["user", "added_at"])]

