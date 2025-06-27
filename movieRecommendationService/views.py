from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .movieRecModel import recommendationSystemTest
from django.core.cache import cache
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

            timeToGetKey = time.perf_counter()

            movieInfo = cache.get(cacheKey)

            elapsed_ms_time = (time.perf_counter() - timeToGetKey) * 1000

            # It does not exist in the cache (miss)
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

                tmdbData = tmdbData.get("results", [{}])[0]

                # Save the information under that key for an hour
                cache.set(cacheKey, tmdbData, timeout=3600)

                # Because of what the JSON object that is recieved 
                # looks like, we just get the top result, which
                # is what we are looking for
                movieInfo = tmdbData.get("results", [{}])[0]

            # The information exists in the cache!    
            else :
                print(f"[Cache Hit] {cacheKey} (lookup took {elapsed_ms_time:.2f} ms)")

            # Start creating the json object
            data.append({
                "id": index,
                "movie": title,
                "yearOfRelease": year,
                "poster": f"https://image.tmdb.org/t/p/w200{movieInfo.get('poster_path')}",
                "description": movieInfo.get("overview", ""),
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
    

