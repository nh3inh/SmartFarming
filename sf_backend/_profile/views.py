from rest_framework.views import APIView
from django.http import JsonResponse
from _profile.services import UserService
from utils.jwt_utils import decode_token

class UserDataView(APIView):
    service = UserService()

    def get(self, request):
        user_id = request.GET.get("user_id")
        if not user_id:
            return JsonResponse({"error": "User ID is required"}, status=400)
        user_data = self.service.get_user_data(user_id)
        return JsonResponse(user_data, status=200 if user_data.get("success") else 404)

    def post(self, request):
        data = request.data
        if not data:
            return JsonResponse({"message": "Please enter full information"}, status=400)
        result = self.service.create_user_data(data)
        return JsonResponse(result, status=201 if result.get("success") else 400)


class ChangeDataUser(APIView):
    service = UserService()

    def post(self, request):
        user_id = request.data.get("id")
        update_data = {
            "first_name": request.data.get("firstName"),
            "last_name": request.data.get("lastName"),
            "email": request.data.get("email"),
            "phone": request.data.get("phone"),
        }
        result = self.service.update_user_data(user_id, update_data)
        return JsonResponse(result, status=200 if result.get("success") else 404)


class UserProfileView(APIView):
    service = UserService()

    def get(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            return JsonResponse({"success": False, "message": "Missing token"}, status=400)
        
        payload = decode_token(token)
        if "error" in payload:
            return JsonResponse({"success": False, "message": payload["error"]}, status=401)
        
        user_id = payload.get("user_id")
        user_data = self.service.get_user_data(user_id)
        if not user_data.get("success"):
            return JsonResponse({"success": False, "message": "User not found"}, status=404)
        
        data = user_data["data"][0]
        return JsonResponse({
            "success": True,
            "id": data.get("id"),
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "role": data.get("role")
        })