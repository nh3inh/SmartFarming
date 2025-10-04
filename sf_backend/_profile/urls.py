from django.urls import path
from .views import *

urlpatterns = [
    path('UserDataView/', UserDataView.as_view(), name='user_data_view'),
    path('change-dataUser/', ChangeDataUser.as_view(), name='change_password'),
    path('users/', UserDataView.as_view(), name='user-data'),
    path('', UserProfileView.as_view(), name='user-profile'),
]