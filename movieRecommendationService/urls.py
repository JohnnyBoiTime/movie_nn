from django.urls import path
from .views import RecommendationView

urlpatterns = [
    path('movieRecommendationService/', RecommendationView.as_view(), name='movieRecommendationService'),
]