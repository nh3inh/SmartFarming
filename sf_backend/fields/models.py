# fields/models.py
from django.contrib.gis.db import models

from django.contrib.gis.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone

class Farmer(models.Model):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, default="user")
    is_active = models.BooleanField(default=True)
    is_google_account = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class FarmerSession(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name="sessions")
    access_token = models.TextField()
    refresh_token = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session for {self.farmer.email} at {self.created_at}"

class Cornfield(models.Model):
    owner = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='cornfields')
    name = models.CharField(max_length=200)
    geom = models.PolygonField(srid=4326)
    area_m2 = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
