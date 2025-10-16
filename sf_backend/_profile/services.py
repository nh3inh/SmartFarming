from utils.mongo import MongoDB
mongo = MongoDB()

from bson.objectid import ObjectId
from utils.jwt_utils import create_verify_token
from utils.email_utils import send_verify_email
from datetime import datetime
from utils.jwt_utils import decode_token
import bcrypt
from django.contrib.auth.models import User
from django.http import JsonResponse
import boto3
import uuid
from django.conf import settings
import requests
from googletrans import Translator


class UserService:
    """
    Service class for handling user data operations with MongoDB.
    """
    
    def __init__(self):
        """
        Initialize the UserService with the user collection.
        """
        self.collection = mongo.get_collection('user')

    def get_user_data(self, user_id ):
        try:
            user_data = self.collection.find({"_id": ObjectId(user_id)})
            if user_data:
                return {
                    "success": True,
                    "data": [ 
                        {
                            "id": str(user["_id"]),
                            "first_name": user.get("first_name"),
                            "last_name": user.get("last_name"),
                            "email": user.get("email"),
                            "role": user.get("role"),
                            "is_google_account": user.get("is_google_account", False),
                            "created_at": user.get("created_at").strftime("%Y-%m-%d %H:%M:%S") if user.get("created_at") else None
                        } for user in user_data
                    ]
                }
            return {"success": False, "message": "No user data found"}
        except Exception as e:
            return {"success": False, "message": f"An error occurred: {str(e)}"}
    
    def create_user_data(self, data):
        """
        Tạo user mới từ dữ liệu Google.
        Chỉ giữ các trường cần thiết: first_name, last_name, email, role, is_google_account, created_at
        """
        try:
            if not data or not data.get("email"):
                return {"success": False, "message": "Invalid data"}

            existing_user = self.collection.find_one({"email": data.get("email")})
            if existing_user:
                return {"success": False, "message": "Email already exists"}

            user_data = {
                "first_name": data.get("first_name"),
                "last_name": data.get("last_name"),
                "email": data.get("email"),
                "role": "user",
                "is_google_account": True,
                "created_at": datetime.now()
            }

            if "is_verify" in data:
                user_data["is_verify"] = data["is_verify"]

            result = self.collection.insert_one(user_data)

            return {
                "success": True,
                "message": "User created successfully",
                "user_id": str(result.inserted_id),
                "role": user_data["role"]
            }

        except Exception as e:
            return {"success": False, "message": f"An error occurred: {str(e)}"}

    def update_user_data(self, user_id, data):
        """
        Cập nhật thông tin người dùng trong MongoDB.
        
        Args:
            user_id (str): ID của người dùng cần cập nhật.
            data (dict): Dữ liệu mới để cập nhật.
            
        Returns:
            dict: Kết quả của quá trình cập nhật.
        """
        try:
            # Chuyển đổi user_id thành ObjectId
            user_object_id = ObjectId(user_id)

            # Cập nhật dữ liệu người dùng
            result = self.collection.update_one({"_id": user_object_id}, {"$set": data})
            
            if result.modified_count > 0:
                return {'message': 'Success'}
            else:
                return {'success': 'Fail'}
        except Exception as error:
            return {'error': str(error)}