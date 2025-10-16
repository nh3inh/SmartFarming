from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Cornfield

class cornfieldSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Cornfield
        geo_field = 'geom'
        fields = ('id', 'name', 'owner', 'area_m2', 'created_at', 'updated_at')
