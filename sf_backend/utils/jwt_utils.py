import jwt
from datetime import datetime, timedelta
from django.conf import settings
from jwt.exceptions import (
    InvalidSignatureError,
    ExpiredSignatureError,
    DecodeError,
    InvalidTokenError
)
from django.http import HttpResponse

def create_verify_token(email):
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=30),
        "purpose": "email_verification"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def decode_token_notime(token: str):
    try:
        decoded = jwt.decode(token,settings.SECRET_KEY, algorithms=["HS256"], options={"verify_exp": False})
        return decoded
    except ExpiredSignatureError:
        return {"error": "expired"}
    except Exception as e:
        return {"error": "unknown_error"}
    
def decode_token(token: str):
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

def get_user_from_request(request):
    token = request.COOKIES.get('access_token')
    if not token:
        return {"error": "missing_token"}

    payload = decode_token(token)
    if 'error' in payload:
        return payload

    return {
        "user_id": payload.get("user_id"),
        "role": payload.get("role")
    }

def create_access_token(user_id,role):
    payload = {
        "user_id": user_id,  
        "role":role,
        "exp": datetime.utcnow() + timedelta(minutes=90), 
        "purpose": "user_authentication" 
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def create_refresh_token(user_id,role):
    payload = {
        "user_id": user_id,  
        "role":role,
        "exp": datetime.utcnow() + timedelta(days=2), 
        "purpose": "refresh_token",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def create_cookie(access_token,refresh_token):
    samesite_value = 'Lax'  
    domain_value = 'localhost'
    response = HttpResponse()
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=True, 
        samesite=samesite_value,
        domain=domain_value,
        max_age=2*24*3600
            )
    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,      
        secure=True,       
        samesite=samesite_value,  
        domain=domain_value, 
        max_age=60*60     
        ) 
    return response
