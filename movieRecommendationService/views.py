from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .movieRecModel import recommendationSystemTest
from django.core.cache import cache

# Create your views here.



# API respones from the model and TMDB
class RecommendationView(APIView):
    def get(self, request):
        movieTitle = request.query_params.get('title')
        movieYear = request.query_params.get('year')
        k = int(request.query_params.get('k', 5))
        recommendation = recommendationSystemTest(movieTitle, movieYear, k)
        # Include id so we can render in next js using .map
        data = [
            {
                "id": index,
                'movie': movie, 
                'similarityScore': score
            } 
            for index, (movie, score) in enumerate(recommendation, start=1)
            ]
        return JsonResponse(data,
                            safe=False, 
                            json_dumps_params={'indent': 2}
                            )
    

