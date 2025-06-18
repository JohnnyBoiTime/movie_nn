from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .movieRecModel import recommendationSystemTest

# Create your views here.

# API respones from the model
class RecommendationView(APIView):
    def get(self, request):
        movieTitle = request.query_params.get('title')
        movieYear = request.query_params.get('year')
        k = int(request.query_params.get('k', 5))
        recommendation = recommendationSystemTest(movieTitle, movieYear, k)
        data = [{'Movie: ': movie, 'Similarity Score': score} for movie, score in recommendation]
        return JsonResponse({'Top recommendations': data}, 
                        json_dumps_params={'indent': 2})
    

