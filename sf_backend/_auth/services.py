from utils.mongo import MongoDB
mongo = MongoDB()

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


class SessionUser:
    def __init__(self):
        self.session_collection  = mongo.get_collection('User_sessions')
        self.collection = mongo.get_collection('user')
    #cearte user session  
    def create_session(self,user_id,email,role):
        access_token = create_access_token(str(user_id),role)
        refresh_token = create_refresh_token(str(user_id),role)
        # Kiểm tra xem đã có session cho user chưa
        existing_session = self.session_collection.find_one({"user_id": str(user_id)})
        if existing_session:
            self.session_collection.update_one(
                {"user_id": str(user_id)},
                {
                    "$set": {
                        "Access_Token": access_token,
                        "Refresh_Token": refresh_token,
                        "Created_at": datetime.now()
                    }
                }
            )
        else:
            dataSession = {
                "user_id": str(user_id),
                "Access_Token": access_token,
                "Refresh_Token": refresh_token,
                "Created_at": datetime.now()
            } 
            self.collection.update_one(
                            {'email': email},
                            {'$set': {'is_active': True}}  
                        )
            self.session_collection.insert_one(dataSession)
        return {
            "Access_Token": access_token,
            "Refresh_Token": refresh_token
        } 
  
class AuthServices(SessionUser):
    def __init__(self):
        super().__init__()

    def logout_user(self, token):
        try:
            data = decode_token(token)
            if 'error' in data:
                return JsonResponse({"success": False, "message": data})
            
            user_id = data['user_id']
            
            if user_id:
                self.collection.update_one({'_id': user_id}, {'$set': {'is_active': False}})
                self.session_collection.delete_one({"user_id": user_id})
                
                response = JsonResponse({"success": True, "message": "Logout successfully"})
                domain_value = ''
                response.delete_cookie('refresh_token', samesite='None',path='/')
                response.delete_cookie('access_token', samesite='None', path='/')
                return response

            return JsonResponse({"success": False, "message": "Invalid user_id"}, status=400)

        except Exception as e:
            return JsonResponse({"success": False, "message": f"error: {str(e)}"}, status=500)

    def refresh_Token(self,token):
        try:
            data = decode_token(token) 
            #check error decode token and return error
            if "error" in data: 
                #error exprired
                if data.get("error") == "expired":
                    return {"success": False, "message": "refresh_token is expired"}
                
                return {"success": False, "message": "invalid refresh_token"}
                    #check token no time to take user_id
            user_id = data.get('user_id')
            role = data.get('role')
                    #find user in collection User_sessions
            user_Data = self.session_collection.find_one({"user_id":user_id})
            if not user_Data:
                return {"success": False, "message": "User not found"}
            
            if token != user_Data.get('Refresh_Token'):
                return {"success": False, "message": "Invalid refresh_token (mismatch)"}
            
            new_access_token = create_access_token(user_id, role)
            self.session_collection.update_one(
                {"user_id": user_id},
                {"$set": {"Access_Token": new_access_token}}
            )

            return {
                "success": True,
                "message": "refresh successfully",
                "new_access_token": new_access_token
            }

        except Exception as e:
            return {"success": False, "message": f"error: {str(e)}"}
        #             if token != user_Data.get('Access_Token'):
        #                 return {"Success":False,"message":"error Token"}
        #             if not user_Data:
        #                 return {"success": False,"message":"User not Found"}
        #             refresh_token  = user_Data.get('Refresh_Token')
        #             check_token = decode_token(refresh_token)
        #             if check_token:
        #                 if check_token.get("error") == "expired":
        #                     return {"success":False,"message":"refresh_token is expired"}
        #                 new_accessToken = create_access_token(str(user_id),role)
        #                 self.session_collection.update_one({'user_id':user_id},{'$set':{'Access_Token':new_accessToken}})
        #                 return {"success": True,"message":"refresh successfully","new_access_token":new_accessToken}
        #         return{"success":False,"message":data}
        #     return{"success": True,"message":"token still work","access_token":data}
        # except Exception as e:
        #     return {"success": False, "message": f"error: {str(e)}"}    
    
    def login_google(self,accessToken):
        try:   
            url = 'https://www.googleapis.com/oauth2/v3/userinfo';       
            headers = {
                    "Authorization": f"Bearer {accessToken}"
            }
            
            response =  requests.get(url, headers=headers)
            infor_google = response.json()
            if "error" in infor_google:
                return {"success":False,"message":infor_google}
            email = infor_google['email']
            user_data = self.collection.find_one({"email":email})
            if user_data:   
                if user_data['is_google_account'] == True:   
                    dataSession = self.create_session(user_data['_id'],email,user_data['role'])
                    return {
                            "success": True,
                            "message": "login success",
                            "access_token": dataSession['Access_Token'],
                            "refresh_token":dataSession['Refresh_Token'],
                            "user_id": str(user_data['_id'])
                        }
                self.collection.update_one({'_id':user_data['_id']},{'$set':{"is_google_account":True}})
                dataSession = self.create_session(user_data['_id'],email,user_data['role'])
                return {
                            "success": True,
                            "message": "login success",
                            "access_token": dataSession['Access_Token'],
                            "refresh_token":dataSession['Refresh_Token'],
                            "user_id": str(user_data['_id'])
                        }
            # if user no exist then create new user
            userservice = UserService()
            data = {
                "first_name":infor_google['given_name'],
                "last_name":infor_google['family_name'],
                "email":email,
                "role":"user",
                "is_verify":infor_google['email_verified'],
                "is_google_account":True,
            }
            #create user 
            create_user = userservice.create_user_data(data)
            if not create_user:
                return {"success": False, "message": "Create user failed"}
            #create session and login
            if create_user['success']:
                dataSession = self.create_session(create_user["user_id"], email,create_user['role'])
                return {
                    "success": True,
                    "message": "login success",
                    "access_token": dataSession['Access_Token'],
                    "refresh_token": dataSession['Refresh_Token'],
                    "user_id": create_user["user_id"]
                }
            else:
                return {"success": False, "message": "Create user failed", "detail": create_user}
        except Exception as e:
             return {"success": False, "message": f"error: {str(e)}"}

    def create_cookie(self, access_token, refresh_token):
        if isinstance(access_token, bytes):
            access_token = access_token.decode("utf-8")
        if isinstance(refresh_token, bytes):
            refresh_token = refresh_token.decode("utf-8")
        response = HttpResponse("Login successful")
        response.set_cookie("access_token", access_token, httponly=True, max_age=3600, secure=False, samesite='Lax', path='/')
        response.set_cookie("refresh_token", refresh_token, httponly=True, max_age=3600*24*30, secure=False, samesite='Lax', path='/')
        return response