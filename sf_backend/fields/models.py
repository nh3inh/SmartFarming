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

class CornfieldInfo(models.Model):
    farmer = models.ForeignKey('Farmer', on_delete=models.CASCADE, related_name='infos')
    cornfield = models.ForeignKey('Cornfield', on_delete=models.CASCADE, related_name='infos')

    timestamp = models.DateTimeField()
    disease_class = models.CharField(max_length=100)
    confidence = models.FloatField()
    ms = models.FloatField()
    image_rel = models.CharField(max_length=255)

    gps_fix = models.BooleanField(default=False)
    gps_lat = models.FloatField(null=True, blank=True)
    gps_lon = models.FloatField(null=True, blank=True)
    gps_alt = models.FloatField(null=True, blank=True)
    gps_time = models.DateTimeField(null=True, blank=True)
    gps_source = models.CharField(max_length=50, blank=True, null=True)

    env_ok = models.BooleanField(default=True)
    env_time = models.DateTimeField(null=True, blank=True)
    env_port = models.CharField(max_length=50, blank=True, null=True)
    env_source = models.CharField(max_length=50, blank=True, null=True)
    temp = models.FloatField(null=True, blank=True)
    hum = models.FloatField(null=True, blank=True)
    ph = models.FloatField(null=True, blank=True)
    soil = models.FloatField(null=True, blank=True)
    wind = models.FloatField(null=True, blank=True)
    wind_avg = models.FloatField(null=True, blank=True)
    lux = models.FloatField(null=True, blank=True)

    status = models.IntegerField(default=0)
    severity = models.CharField(max_length=50, blank=True, null=True)
    treatment_payload = models.JSONField(default=dict, blank=True)
    fertilizer_payload = models.JSONField(default=dict, blank=True)
    water_payload = models.JSONField(default=dict, blank=True)
    summary_comment = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.disease_class} ({self.timestamp}) - Farmer {self.farmer.id} / Cornfield {self.cornfield.id}"