from django.urls import path
from .views import *

urlpatterns = [
    path('logout/', LogoutUser.as_view(), name='logout'),
    path('refresh_Token/',RefreshToken.as_view(),name="token"),
    path('login_google/',LoginGG.as_view(),name="login_google"),
    path('google/callback/',GoogleCallback.as_view(),name ="google_callback"),
    path('get_user_id/',GetUserIdView.as_view(), name = "get-user_id"),
    path("google_oauth_start/", GoogleOAuthStart.as_view(), name="google_start"),
    path("google/callback/", GoogleCallback.as_view(), name="google_callback"),
]