from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt, csrf_protect
from rest_framework.views import APIView
from rest_framework.response import Response
from .movieRecModel import recommendationSystemTest
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core.cache import cache
import json
import time
import requests

# API key

"""
  movieArray[i] = {
            id: i,
            movie: movieTitle,
            yearOfRelease: data.release_date.split("-")[0],
            description: data.overview,
            poster: `${imageURL}${imageSize}${data.poster_path}`,
            similarityScore: nnResponse.data[i].similarityScore
          }
          
"""

"""
  const imageURL = 'https://image.tmdb.org/t/p/';
    const imageSize = 'w200';
"""

# API respones from the model and TMDB
class RecommendationView(APIView):
    def get(self, request):

        movieTitle = request.query_params.get('title')
        movieYear = request.query_params.get('year')
        k = int(request.query_params.get('k', 5))
        recommendation = recommendationSystemTest(movieTitle, movieYear, k)

        data = []

        for index, (movie, score) in enumerate(recommendation, start=1):

            # Given Heat (1995)
            title, year = movie.split(" (") # ["Heat", "1995)"]
            year = year.rstrip(")") # 1995


            # Check if the information already exists in redis
            # to reduce request strain (hit)
            cacheKey = f"tmdb:search:{title}:{year}"

            # Log time to get key to make sure cache is working
            timeToGetKey = time.perf_counter()

            # Check to see if the movie already exists
            # in the cache
            movieInfo = cache.get(cacheKey)

            elapsed_ms_time = (time.perf_counter() - timeToGetKey) * 1000

            # It does not exist in the cache (miss), so add
            # it do the cache
            if movieInfo is None:

                print(f"[Cache miss] {cacheKey} (lookup took {elapsed_ms_time:.2f} ms)")

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

                # Only need to save the first result
                tmdbData = tmdbData.get("results", [{}])[0]

                # Save the information under that key for an hour
                cache.set(cacheKey, tmdbData, timeout=3600)

                # Because of what the JSON object that is recieved 
                # looks like, we just get the top result, which
                # is what we are looking for
                movieInfo = tmdbData

            # The information exists in the cache!
            # Log time omg
            else :
                print(f"[Cache Hit] {cacheKey} (lookup took {elapsed_ms_time:.2f} ms)")

            # Fill in all information for the JSON
            moviePosterPath = movieInfo.get('poster_path')
            moviePoster = f"https://image.tmdb.org/t/p/w200{moviePosterPath}"
            movieDescription = movieInfo.get("overview", "")
    

            # Send next.js the information for the movie
            data.append({
                "id": index,
                "movie": title,
                "yearOfRelease": year,
                "poster": moviePoster,
                "description": movieDescription,
                "similarityScore": score,
            })


        """
        # Include id so we can render in next js using .map
        data = [

            {
                "id": index,
                'movie': movie, 
                'similarityScore': score
            } 
            for index, (movie, score) in enumerate(recommendation, start=1)
            ]

         """   
        return JsonResponse(data,
                            safe=False, 
                            json_dumps_params={'indent': 2}
                            )
    
######################################
# CSRF AND USER AUTHENTICATION VIEWS #
######################################

# Set the csrf cookie
@ensure_csrf_cookie
def csrfTokenView(request):
    print("CSRF TOKEN!!!!")
    return JsonResponse({'detail': 'CSRF cookie set'})

# Validates login
def userLogin(request):
    if request.method != "POST":
        return JsonResponse({"detail": "POST Method not allowed"}, status=405)
    
    data = json.loads(request.body)
    user = authenticate(
        request,
        username = data.get("username"),
        password = data.get("password"),
    )

    if user is None:
        return JsonResponse({"detail": "Invalid credentials"}, status=401)
    
    login(request, user)
    return JsonResponse({"detail": "Login success!!!"})


# Registers the user
@csrf_protect
def userRegister(request):
    if request.method != "POST":
        return JsonResponse({"detail": "POST method only"}, status=405)

    data = json.loads(request.body)
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return JsonResponse({"detail": "Username, email, and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"detail": "Username already in use"}, status=400)
    
    User.objects.create_user(
        username = username,
        email = email,
        password=password # Already hashed by django here!
    )
    return JsonResponse({"detail": "Successfully registered!"}, status=201)



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

