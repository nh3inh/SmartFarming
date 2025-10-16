from rest_framework import viewsets
from .models import Cornfield, Farmer
from .serializers import cornfieldSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.geos import Point

class CornfieldViewSet(viewsets.ModelViewSet):
    queryset = Cornfield.objects.all()
    serializer_class = cornfieldSerializer

class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all()
    serializer_class = None
