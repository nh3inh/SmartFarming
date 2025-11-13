import requests
from rest_framework import viewsets
from .models import Cornfield, Farmer, CornfieldInfo
from .serializers import CornfieldSerializer, CornfieldInfoSerializer, FarmerSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from rest_framework import permissions
from django.http import JsonResponse
from django.db.models import Max, Min
from django.db.models import Max

class CornfieldViewSet(viewsets.ModelViewSet):
    queryset = Cornfield.objects.all()
    serializer_class = CornfieldSerializer

class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all()
    serializer_class = FarmerSerializer

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
        
    @action(detail=False, methods=['get'], url_path='latest-fields')
    def latest_fields(self, request):
        """
        API trả về bản ghi mới nhất cho mỗi cặp (farmer_id, cornfield_id)
        """
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

        # Lọc các bản ghi của farmer
        user_infos = self.queryset.filter(farmer_id=user_id)

        # Lấy latest per cornfield_id
        latest_infos = (
            user_infos
            .values('farmer_id', 'cornfield_id')  # nhóm theo farmer + cornfield
            .annotate(latest_created=Max('created_at'))  # chọn created_at gần nhất
        )

        # Lấy bản ghi thực tế dựa trên farmer_id + cornfield_id + latest_created
        results = []
        for info in latest_infos:
            record = user_infos.filter(
                farmer_id=info['farmer_id'],
                cornfield_id=info['cornfield_id'],
                created_at=info['latest_created']
            ).first()
            if record:
                results.append(record)

        serializer = self.get_serializer(results, many=True)

        return Response({
            "success": True,
            "count": len(serializer.data),
            "data": serializer.data
        })
        
    @action(detail=False, methods=['get'], url_path='earliest-fields-public', permission_classes=[])
    def earliest_fields_public(self, request):
        """
        API public: trả về bản ghi có created_at sớm nhất cho mỗi cặp (farmer_id, cornfield_id)
        Không cần xác thực.
        Response giống /cornfields/info/
        """
        all_infos = self.queryset.all()

        earliest_infos = (
            all_infos
            .values('farmer_id', 'cornfield_id')
            .annotate(earliest_created=Max('created_at'))
        )

        results = []
        for info in earliest_infos:
            record = all_infos.filter(
                farmer_id=info['farmer_id'],
                cornfield_id=info['cornfield_id'],
                created_at=info['earliest_created']
            ).first()
            if record:
                results.append(record)

        serializer = self.get_serializer(results, many=True)

        return Response({
            "success": True,
            "count": len(serializer.data),
            "data": serializer.data
        })