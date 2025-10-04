from django.http import JsonResponse
from django.conf import settings
from utils.jwt_utils import get_user_from_request
import jwt
from jwt.exceptions import (
    InvalidSignatureError,
    ExpiredSignatureError,
    DecodeError,
    InvalidTokenError
)
class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        #So sánh xem path có bắt đầu với prefix hay không, dùng cho nhóm URL có chung tiền tố ,tat ca role
        self.exclude_prefixes = [
                '/api/auth/',
                '/api/profile/users/',
                '/api/profile/reset_password/',
                '/api/userInfo',
               
            ]
        #role admin
        self.exclude_prefixes_admin = [
            
        ]
        #role user
        self.exclude_prefixes_user = [
            '/api/profile/users/',
            '/api/profile/',
            '/api/auth/get_user_id/'
        ]
        self.secret_key = settings.SECRET_KEY  
    def __call__(self, request):
        path = request.path
        for prefix in self.exclude_prefixes:
            if path.startswith(prefix):
                return self.get_response(request)

        user_info = get_user_from_request(request)
        if 'error' in user_info:
            return JsonResponse({"success": False, "message": user_info["error"]}, status=401)
        role = user_info.get("role")
        if role == 'admin':
            for prefix in self.exclude_prefixes_admin:
                if path.startswith(prefix):
                    return self.get_response(request)
        elif role == 'user':
            for prefix in self.exclude_prefixes_user:
                if path.startswith(prefix):
                    return self.get_response(request)
        else:
            return JsonResponse({'error': 'role invalid'}, status=403)
        return JsonResponse({"success": False, "message": "Authorization"}, status=401)
    
    def decode_token(self,token: str): 
        try:
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return decoded

        except ExpiredSignatureError:
            return {"error": "expired"}

        except InvalidSignatureError:
            return {"error": "invalid_signature"}

        except DecodeError:
            return {"error": "decode_error"}

        except InvalidTokenError:
            return {"error": "invalid_token"}

        except Exception as e:
            return {"error": "unknown_error"}
