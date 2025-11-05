from django.db import models
from fields.models import Farmer
from fields.models import Cornfield 

class FarmerField(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='fields')
    cornfield = models.ForeignKey(
        Cornfield,
        on_delete=models.CASCADE,
        related_name='farmer_fields',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=100)
    soil_type = models.CharField(max_length=50)
    crop_type = models.CharField(max_length=50)
    sowing_date = models.DateField()
    iot_device_id = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.farmer})"

class Disease(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    recommended_treatment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name