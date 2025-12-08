import requests
from django.http import JsonResponse
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import FarmerField
from .serializers import FarmerFieldSerializer
from rest_framework.exceptions import PermissionDenied

PROFILE_API_URL = "https://tlrice.space/api/profile/"


class FarmerFieldListCreateAPIView(generics.ListCreateAPIView):
    """
    API: List all farmer's fields and create a new field
    """
    serializer_class = FarmerFieldSerializer
    permission_classes = [permissions.AllowAny]

    def get_user_id_from_profile(self, request):
        """
        Gọi profile API để lấy user_id dựa vào cookies
        """
        cookies = request.COOKIES
        try:
            res = requests.get(PROFILE_API_URL, cookies=cookies, timeout=5)
        except Exception as e:
            raise PermissionDenied(f"Profile API error: {str(e)}")

        if res.status_code != 200:
            raise PermissionDenied("Cannot get user info from profile API")

        profile_data = res.json()
        if not profile_data.get("success") or not profile_data.get("id"):
            raise PermissionDenied("Invalid profile data")

        return profile_data["id"]

    def get_queryset(self):
        user_id = self.get_user_id_from_profile(self.request)
        return FarmerField.objects.filter(farmer_id=user_id)

    def perform_create(self, serializer):
        user_id = self.get_user_id_from_profile(self.request)
        serializer.save(farmer_id=user_id)


class FarmerFieldRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API: Retrieve, update, or delete a single farmer field
    """
    serializer_class = FarmerFieldSerializer
    permission_classes = [permissions.AllowAny]

    def get_user_id_from_profile(self, request):
        cookies = request.COOKIES
        try:
            res = requests.get(PROFILE_API_URL, cookies=cookies, timeout=5)
        except Exception as e:
            raise PermissionDenied(f"Profile API error: {str(e)}")

        if res.status_code != 200:
            raise PermissionDenied("Cannot get user info from profile API")

        profile_data = res.json()
        if not profile_data.get("success") or not profile_data.get("id"):
            raise PermissionDenied("Invalid profile data")

        return profile_data["id"]

    def get_queryset(self):
        user_id = self.get_user_id_from_profile(self.request)
        return FarmerField.objects.filter(farmer_id=user_id)

class PublicFarmerFieldListAPIView(generics.ListAPIView):
    """
    API public: Lấy thông tin tất cả ruộng lúa của tất cả nông dân
    """
    queryset = FarmerField.objects.all()
    serializer_class = FarmerFieldSerializer
    permission_classes = [permissions.AllowAny]