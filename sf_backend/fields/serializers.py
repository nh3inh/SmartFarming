from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Cornfield
from django.contrib.gis.geos import GEOSGeometry

class CornfieldSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Cornfield
        geo_field = 'geom'
        fields = ('id', 'name', 'owner', 'area_m2', 'created_at', 'updated_at')

    def create(self, validated_data):
        geom_data = validated_data.pop('geom')
        # Convert dict GeoJSON sang GEOSGeometry
        if isinstance(geom_data, dict):
            geom_data = GEOSGeometry(str(geom_data))
        return Cornfield.objects.create(geom=geom_data, **validated_data)
