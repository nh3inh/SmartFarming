from rest_framework import viewsets
from .models import Cornfield, Farmer, CornfieldInfo
from .serializers import CornfieldSerializer, CornfieldInfoSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from rest_framework import permissions
from django.http import JsonResponse
import requests

class CornfieldViewSet(viewsets.ModelViewSet):
    queryset = Cornfield.objects.all()
    serializer_class = CornfieldSerializer

class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all()
    serializer_class = None

class CornfieldInfoViewSet(viewsets.ModelViewSet):
    queryset = CornfieldInfo.objects.all()
    serializer_class = CornfieldInfoSerializer

    @action(detail=False, methods=['get'], url_path='my-fields')
    def my_fields(self, request):
        try:
            profile_url = f"http://localhost:8000/api/profile/"
            cookies = request.COOKIES
            res = requests.get(profile_url, cookies=cookies, timeout=5)
        except Exception as e:
            return JsonResponse({"success": False, "message": f"Profile API error: {str(e)}"}, status=500)

        if res.status_code != 200:
            return JsonResponse({"success": False, "message": "Cannot get user info"}, status=res.status_code)

        profile_data = res.json()
        if not profile_data.get("success"):
            return JsonResponse({"success": False, "message": "Profile failed"}, status=401)

        user_id = profile_data.get("id")
        if not user_id:
            return JsonResponse({"success": False, "message": "Invalid profile data"}, status=401)

        infos = self.queryset.filter(farmer_id=user_id)
        serializer = self.get_serializer(infos, many=True)

        return Response({
            "success": True,
            "count": len(serializer.data),
            "data": serializer.data
        })
        
        