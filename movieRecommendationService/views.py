from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.middleware.csrf import get_token, rotate_token
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt, csrf_protect
from rest_framework.views import APIView
from .movieRecModel import recommendationSystemTest
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core.cache import cache
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from .models import Movie, SavedMovies
import json
import time
import requests

# API respones from the model and TMDB
@method_decorator(
    ratelimit(key='ip', rate='5/m', block=False),
    name='dispatch'
)
class RecommendationView(APIView):

    # Reached the rate limit
    def dispatch(self, request, *args, **kwargs):

        if getattr(request, 'limited', False):

            # return a 429 with a JSON body
            return JsonResponse(
                {'detail': 'Too many requests sent!'},
                status=429
            )
        
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):

        movieTitle = request.query_params.get('title')
        movieYear = request.query_params.get('year')
        k = int(request.query_params.get('k', 5))
        recommendation = recommendationSystemTest(movieTitle, movieYear, k)

        data = []

        for index, (movie, score) in enumerate(recommendation, start=1):

            # Split only on the last paranthesis to
            # ignore paranthesis before the year. 
            # example: Saving Silverman (Evil Woman) (2001)
            # ignores (Evil Woman). Ensures we get only the title 
            # and year
            titleYear = movie.rsplit(" (", 1)
            title = titleYear[0]
            year = titleYear[1].rstrip(")") if len(titleYear) == 2 else ""

            # Check if the information already exists in cache
            # to reduce request strain (hit)
            cacheKey = f"tmdb:search:{title}:{year}"

            # Check to see if the movie already exists
            # in the cache
            movieInfo = cache.get(cacheKey)

            # It does not exist in the cache (miss), so add
            # it do the cache
            if movieInfo is None:

                # Get info from TMDB for description and a movie poster
                tmdbResponse = requests.get(settings.TMDB_SEARCH_URL,
                                            params={
                                                "api_key": settings.TMDB_API_KEY,
                                                "query": title,
                                                "year": year
                                            },
                                            )
                
                # Store json in the cache! 
                tmdbResponse.raise_for_status()
                tmdbData = tmdbResponse.json()

                # Filter out some results for better stuff
                results = tmdbData.get("results") or []

                # May not be able to be queried,
                # So return amount found
                if not results:
                    return JsonResponse(
                        data,
                        safe=False,
                        json_dumps_params={'indent': 2} 
                        )

                # Store title as key
                tmdbData = results[0]

                # Save the information under that key for an hour
                cache.set(cacheKey, tmdbData, timeout=3600)

                # Because of what the JSON object that is recieved 
                # looks like, we just get the top result, which
                # is what we are looking for
                movieInfo = tmdbData

            # The information exists in the cache!

            # Fill in all information for the JSON
            moviePosterPath = movieInfo.get('poster_path')
            moviePoster = f"https://image.tmdb.org/t/p/w200{moviePosterPath}"
            movieDescription = movieInfo.get("overview", "")
            tmdb_id = movieInfo.get("id")
    

            # Send next.js the information for the movie
            data.append({
                "id": index,
                "tmdb_id": tmdb_id,
                "movie": title,
                "yearOfRelease": year,
                "poster": moviePoster,
                "description": movieDescription,
            })

        return JsonResponse(data,
                            safe=False, 
                            json_dumps_params={'indent': 2}
                            )
    
# Health check
def healthz(request):
    return HttpResponse("OK", status=200)


# For getting the users saved movies and saving movies
def savedMovies(request):
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({"detail": "Unauthenticated user"}, status=401)

    # Get the users saved movies
    if request.method == 'GET':
        queryDatabase = (SavedMovies.objects
                         .select_related('movie')
                         .filter(user=user)
                         .order_by('-added_at'))
        # Users saved movies
        data = [
            {
                "id": savedMovie.id,
                "added_at": savedMovie.added_at.isoformat(),
                "movie": {
                    "title": savedMovie.movie.title,
                    "year": savedMovie.movie.year,
                    "movie_poster_url": savedMovie.movie.movie_poster_url,
                    "description": savedMovie.movie.description,
                },
            }
            for savedMovie in queryDatabase
        ]
        return JsonResponse(data, safe=False)
    
    # User saves a movie
    if request.method == "POST":

        # Retrieve the fields from the request
        data = json.loads(request.body)
        title = data.get("title")
        year = data.get("year")
        tmdb_id = data.get("tmdb_id")
        movie_poster_url = data.get("movie_poster_url")
        description = data.get("description")

        if not tmdb_id or not title or not year or not movie_poster_url:
            return JsonResponse({"detail": "You are missing some fields! Check again!"}, status=400)
        
        # Check if the movie already exists in the database
        movie, _ = Movie.objects.get_or_create(
            tmdb_id = tmdb_id, # How we are going to find if the movie exists already
            defaults={"title": title, "year": year, "movie_poster_url": movie_poster_url, "description": description}
        )
        
        savedMovie, createdMovie = SavedMovies.objects.get_or_create(user=user, movie=movie)

            # Return the movie we saved to confirm we saved it
        return JsonResponse(
            {
            "id": savedMovie.id,
            "added_at": savedMovie.added_at.isoformat(),
            "movie": {
                "tmdb_id": savedMovie.movie.tmdb_id,
                "title": savedMovie.movie.title,
                "year": savedMovie.movie.year,
                "description": savedMovie.movie.description,
            },
        },
        status=201 if createdMovie else 200
        )
    
    return JsonResponse({"detail": "Worked"})

    
    
#########################################################
# CSRF AND USER AUTHENTICATION/LOGIN/REGISTRATION VIEWS #
#########################################################

# Set the csrf cookie
# @ensure_csrf_cookie
@require_GET # For session based CSRF
def csrfTokenView(request):
    print("CSRF TOKEN!!!!")
    token = get_token(request)
    return JsonResponse({'csrfToken': token})
    # return JsonResponse({'detail': 'CSRF cookie set'})

@csrf_protect
def userLogin(request):
    if request.method != "POST":
        return JsonResponse({"detail": "POST Method only "}, status=405)
    
    data = json.loads(request.body)

    # Authenticate the users credentials in the database
    user = authenticate(
        request,
        username = data.get("username"),
        password = data.get("password"),
    )

    if user is None:
        return JsonResponse({"detail": "Invalid credentials"}, status=401)
    
    login(request, user)
    rotate_token(request)
    

    print(f"User {user.username} Is logged in!")
    return JsonResponse({"detail": "Login success!!!",
                         "csrfToken": get_token(request)
                         })

@csrf_exempt
def verifyUser(request):
    if request.method != "POST":
        return JsonResponse({"detail": "POST Method only "}, status=405)
    
    data = json.loads(request.body)

    # Authenticate the users credentials in the database
    user = authenticate(
        request,
        username = data.get("username"),
        password = data.get("password"),
    )

    if user is None:
        return JsonResponse({"detail": "Invalid credentials"}, status=401)
    

    print(f"User {user.username} Is logged in!")
    return JsonResponse({"detail": "Login success!!!",
                         "username": user.username,
                         "email": user.email,
                         })


# Registers the user
# 5/hour if somehow the user made a mistake in registering
# the first time
# @csrf_protect
@ratelimit(key='ip', rate='3/h', block=False)
def userRegister(request):

    #if getattr(request, "limited", False):
    #    return JsonResponse(
    #            {'detail': 'Too many requests sent!'},
    #            status=429
    #        ) 

    if request.method != "POST":
        return JsonResponse({"detail": "POST Method only "}, status=405)

    # Process incoming json response
    data = json.loads(request.body)
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return JsonResponse({"detail": "Username, email, and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"detail": "Username already in use"}, status=400)
    
    # Put user into database
    User.objects.create_user(
        username = username,
        email = email,
        password=password # Already hashed by django here!
    )

    return JsonResponse({"detail": "Successfully Registered!"}, status=201)



# If logged in, returns the users information.
# This is to make sure the sessionId in the cookie
# matches the server session
def userLoggedIn(request):

    # suspicious user
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "User is not authenticated"}, status = 401)
    
    # Return user info
    return JsonResponse({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
    })



