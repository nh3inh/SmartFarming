from utils.jwt_utils import (
    create_access_token,
    create_refresh_token,
    decode_token,
    create_verify_token
    )
from _profile.services import UserService
from django.http import HttpResponse, JsonResponse
from datetime import datetime
import bcrypt
import requests
from utils.email_utils import ( send_reset_password_email)
from django.utils import timezone
from fields.models import Farmer, FarmerSession
from utils.jwt_utils import create_access_token, create_refresh_token, decode_token

class SessionUser:
    #cearte user session  
    def create_session(self, farmer: Farmer):
        access_token = create_access_token(str(farmer.id), farmer.role)
        refresh_token = create_refresh_token(str(farmer.id), farmer.role)

        # Xoá session cũ nếu có
        FarmerSession.objects.filter(farmer=farmer).delete()

        # Tạo session mới
        session = FarmerSession.objects.create(
            farmer=farmer,
            access_token=access_token,
            refresh_token=refresh_token,
            created_at=timezone.now()
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }
  
class AuthServices(SessionUser):
    def __init__(self):
        super().__init__()

    def logout_user(self, token):
        data = decode_token(token)
        if "error" in data:
            return JsonResponse({"success": False, "message": data}, status=400)

        farmer_id = data["user_id"]
        try:
            farmer = Farmer.objects.get(id=farmer_id)
            farmer.is_active = False
            farmer.save()
            FarmerSession.objects.filter(farmer=farmer).delete()
            response = JsonResponse({"success": True, "message": "Logout successfully"})
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response
        except Farmer.DoesNotExist:
            return JsonResponse({"success": False, "message": "Farmer not found"}, status=400)

    def refresh_token(self, token):
        data = decode_token(token)
        if "error" in data:
            return {"success": False, "message": data.get("error")}

        farmer_id = data.get("user_id")
        try:
            farmer = Farmer.objects.get(id=farmer_id)
            session = FarmerSession.objects.filter(farmer=farmer).first()
            if not session or session.refresh_token != token:
                return {"success": False, "message": "Invalid refresh token"}

            new_access_token = create_access_token(str(farmer.id), farmer.role)
            session.access_token = new_access_token
            session.save()

            return {
                "success": True,
                "new_access_token": new_access_token
            }
        except Farmer.DoesNotExist:
            return {"success": False, "message": "Farmer not found"}
        
    def login_google(self, access_token):
        import requests
        url = 'https://www.googleapis.com/oauth2/v3/userinfo'
        headers = {"Authorization": f"Bearer {access_token}"}
        res = requests.get(url, headers=headers).json()
        
        email = res['email']
        farmer, created = Farmer.objects.get_or_create(email=email, defaults={
            "first_name": res.get("given_name", ""),
            "last_name": res.get("family_name", ""),
            "is_google_account": True,
            "role": "user"
        })

        if not created and not farmer.is_google_account:
            farmer.is_google_account = True
            farmer.save()

        tokens = self.create_session(farmer)
        return {
            "success": True,
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "user_id": farmer.id
        }

    def create_cookie(self, access_token, refresh_token):
        if isinstance(access_token, bytes):
            access_token = access_token.decode("utf-8")
        if isinstance(refresh_token, bytes):
            refresh_token = refresh_token.decode("utf-8")
        response = HttpResponse("Login successful")
        response.set_cookie("access_token", access_token, httponly=True, max_age=3600, secure=False, samesite='Lax', path='/')
        response.set_cookie("refresh_token", refresh_token, httponly=True, max_age=3600*24*30, secure=False, samesite='Lax', path='/')
        return response