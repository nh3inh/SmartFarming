# fields/models.py
from django.contrib.gis.db import models

class Farmer(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True, null=True)

class Cornfield(models.Model):
    owner = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='cornfields')
    name = models.CharField(max_length=200)
    geom = models.PolygonField(srid=4326)
    area_m2 = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
