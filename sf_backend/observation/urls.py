from django.urls import path
from .views import *

urlpatterns = [
    path('farmer-fields/', FarmerFieldListCreateAPIView.as_view(), name='farmerfield-list-create'),
    path('farmer-fields/<int:pk>/', FarmerFieldRetrieveUpdateDestroyAPIView.as_view(), name='farmerfield-detail'),
    path('farmer-fields/public/', PublicFarmerFieldListAPIView.as_view(), name='public-farmerfield-list'),
]