#create user_data function to test user.services.py
from _profile.services import UserService
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from _auth.services import AuthServices
from utils.mongo import mongo 
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.parsers import MultiPartParser
from django.conf import settings
from utils.jwt_utils import decode_token

class UserDataView(APIView):
    """
    API view to handle user data operations.
    """
    service = UserService()
    def get(self, request):
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({'error': 'User ID is required'}, status=400)

        user_data = self.service.get_user_data(user_id)
        if user_data:
            return JsonResponse(user_data, status=200)
        else:
            return JsonResponse({'error': 'User not found'}, status=404)

    def post(self, request):
        data  = request.data
        if data:
            result = self.service.create_user_data(data)
            return JsonResponse(result,status = 201)
        return JsonResponse({'message':'Please enter full information'})
    

class ChangeDataUser(APIView):
    service = UserService()
    def post(self, request):
        user_id = request.data.get('id')
        first_name = request.data.get('firstName')
        last_name = request.data.get('lastName')
        email = request.data.get('email')
        phone = request.data.get('phone')
        update_data = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone': phone
        }
        user_update_response = self.service.update_user_data(user_id, update_data)        
        return Response({'message': 'Success.'}, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    """
    Lấy thông tin user từ access_token
    """
    def get(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            return JsonResponse({"success": False, "message": "Missing token"}, status=400)
        payload = decode_token(token)
        if "error" in payload:
            return JsonResponse({"success": False, "message": payload["error"]}, status=401)
        
        user_id = payload.get("user_id")
        from _profile.services import UserService
        service = UserService()
        user_data = service.get_user_data(user_id)
        if not user_data.get("success"):
            return JsonResponse({"success": False, "message": "User not found"}, status=404)

        data = user_data["data"][0]
        return JsonResponse({
            "success": True,
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "role": data.get("role")
        })