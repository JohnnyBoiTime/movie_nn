from django.urls import path
from .views import RecommendationView, csrfTokenView, userLogin, userRegister, userLoggedIn, healthz

urlpatterns = [
    path('movieRecommendationService/', RecommendationView.as_view(), name='movieRecommendationService'),
    path('csrf/', csrfTokenView, name='csrf-token'),
    path('login/', userLogin, name="user-login"),
    path('register/', userRegister, name="user-register"),
    path("user/", userLoggedIn, name="user-logged-in"),
    path("healthz/", healthz, name='health')
]