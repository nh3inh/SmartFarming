import json
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import Cornfield, Farmer, CornfieldInfo
from django.contrib.gis.geos import GEOSGeometry

class FarmerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmer
        fields = ('id', 'first_name', 'last_name', 'email')

class CornfieldSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Cornfield
        geo_field = 'geom'
        fields = ('id', 'name', 'owner', 'area_m2', 'created_at', 'updated_at')

    def create(self, validated_data):
        geom_data = validated_data.pop('geom')
        if isinstance(geom_data, dict):
            geom_data = GEOSGeometry(str(geom_data))
        
        geom_proj = geom_data.transform(3857, clone=True)
        area = geom_proj.area

        return Cornfield.objects.create(geom=geom_data, area_m2=area, **validated_data)
    def update(self, instance, validated_data):
        geom_data = validated_data.pop('geom', None)
        if geom_data:
            if isinstance(geom_data, dict):
                geom_data = GEOSGeometry(json.dumps(geom_data))
            geom_proj = geom_data.transform(3857, clone=True)
            instance.area_m2 = geom_proj.area
            instance.geom = geom_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
class CornfieldInfoSerializer(serializers.ModelSerializer):
    farmer = FarmerSerializer(
        read_only=True
    )
    cornfield = CornfieldSerializer(read_only=True)
    cornfield_id = serializers.PrimaryKeyRelatedField(
        source='cornfield',
        queryset=Cornfield.objects.all(),
        write_only=True
    )
    class Meta:
        model = CornfieldInfo
        fields = [
            "id",
            "farmer",
            "cornfield",
            "timestamp",
            "disease_class",
            "confidence",
            "cornfield_id",
            "ms",
            "image_rel",
            "gps_fix",
            "gps_lat",
            "gps_lon",
            "gps_alt",
            "gps_time",
            "gps_source",
            "env_ok",
            "env_time",
            "env_port",
            "env_source",
            "temp",
            "hum",
            "ph",
            "soil",
            "wind",
            "wind_avg",
            "lux",
            "status",
            "severity",
            "treatment_payload",
            "fertilizer_payload",
            "water_payload",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_confidence(self, value):
        """Đảm bảo confidence nằm trong khoảng [0, 1]."""
        if not 0 <= value <= 1:
            raise serializers.ValidationError("Confidence must be between 0 and 1.")
        return value
    