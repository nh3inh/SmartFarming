from rest_framework import serializers
from .models import FarmerField

class FarmerFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerField
        fields = [
            "id",
            "farmer",
            "name",
            "soil_type",
            "crop_type",
            "sowing_date",
            "iot_device_id",
            "created_at",
            "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "farmer"]
