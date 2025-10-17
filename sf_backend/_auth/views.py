from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from django.http import JsonResponse
from _auth.services import AuthServices
from utils.jwt_utils import decode_token
import json
import jwt
from rest_framework.response import Response
from rest_framework import status
from utils.jwt_utils import create_cookie
from django.conf import settings
service = AuthServices()
from django.shortcuts import redirect
import urllib.parse
import requests

GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
service = AuthServices()

#logout 
class LogoutUser(APIView):
    def post(self,request):
        token = request.COOKIES.get("access_token")
        if not token:
            return JsonResponse({'success': False, 'message': 'No access token provided'}, status=400)
        return service.logout_user(token)
    
#Refresh Token 
class RefreshToken(APIView):
    def post(self,request,*args, **kwargs):
        samesite_value = 'Lax'
        domain_value = 'localhost'
        # auth_header = request.headers.get("Authorization")
        token = request.COOKIES.get("refresh_token")
        if not token:
            return JsonResponse({'message': 'invalid token or no token'}, status=400)
        result = service.refresh_Token(token)
        if not result.get("success"):
            return JsonResponse(result, status=401)

        response = JsonResponse(result, status=200)
        if result.get("new_access_token"):
            response.set_cookie(
                key='access_token',
                value=result["new_access_token"],
                httponly=True,      
                secure=True,       
                samesite=samesite_value,  
                domain=domain_value, # Chỉ sử dụng trong môi trường phát triển
                max_age=60*60     
            ) 
        return response
    
#login google
class LoginGG(APIView):
    def post(self,request,*args, **kwargs):
        access_token = request.data['access_token'] 
        if access_token :
            result = service.login_google(access_token)
            if result["success"] == True:
                access_token = result["access_token"]
                refresh_token = result["refresh_token"]
                response = create_cookie(access_token,refresh_token)
                response.content = json.dumps(result) 
                response['Content-Type'] = 'application/json'
                return response 
            return JsonResponse(result,status=400)
        return JsonResponse({"message":"can not login"},status=400)

class GoogleCallback(APIView):
    def post(self,request,*args, **kwargs):
        code = request.data['code']
        if code:
            result = service.google_callback(code)
            return JsonResponse(result,status=200)
        return JsonResponse({"message":"no code"},status=400)

class GetUserIdView(APIView):
    def get(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            return Response({"error": "Missing token"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            payload = decode_token(token)
            if isinstance(payload, dict) and "error" in payload:
                if payload["error"] == "expired":
                    return Response({"success": False, "message": "expired"}, status=status.HTTP_401_UNAUTHORIZED)
                return Response({"error": f"Invalid token: {payload['error']}"}, status=status.HTTP_401_UNAUTHORIZED)
            if not payload or "user_id" not in payload:
                return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({"user_id": payload.get("user_id")}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

class GoogleOAuthStart(APIView):
    def get(self, request):
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent"
        }
        url = f"{GOOGLE_OAUTH_URL}?{urllib.parse.urlencode(params)}"
        return redirect(url)
    
class GoogleCallback(APIView):
    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return redirect(f"http://localhost:3000/login?error=no_code")

        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        
        r = requests.post(token_url, data=data)
        token_data = r.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return redirect(f"http://localhost:3000/login?error=no_token")

        result = service.login_google(access_token)
        if not result.get("success"):
            return redirect(f"http://localhost:3000/login?error=login_failed")

        response = service.create_cookie(result["access_token"], result["refresh_token"])
        response['Location'] = f"http://localhost:3000/home"
        response.status_code = 302
        return response