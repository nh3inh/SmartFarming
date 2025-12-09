from fields.models import Farmer
from django.core.exceptions import ObjectDoesNotExist

class UserService:
    """
    Service class Farmer (RDS/PostgreSQL)
    """

    def get_user_data(self, user_id):
        try:
            farmer = Farmer.objects.get(id=user_id)
            return {
                "success": True,
                "data": [
                    {
                        "id": farmer.id,
                        "first_name": farmer.first_name,
                        "last_name": farmer.last_name,
                        "email": farmer.email,
                        "role": farmer.role,
                        "is_google_account": farmer.is_google_account,
                        "created_at": farmer.created_at.strftime("%Y-%m-%d %H:%M:%S")
                    }
                ]
            }
        except ObjectDoesNotExist:
            return {"success": False, "message": "User not found"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def update_user_data(self, user_id, data):
        try:
            farmer = Farmer.objects.get(id=user_id)
            for key, value in data.items():
                setattr(farmer, key, value)
            farmer.save()
            return {"success": True, "message": "User updated successfully"}
        except ObjectDoesNotExist:
            return {"success": False, "message": "User not found"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def create_user_data(self, data):
        """
        Tạo user mới (dùng khi register từ Google)
        """
        if not data.get("email") or not data.get("first_name"):
            return {"success": False, "message": "Missing required fields"}

        if Farmer.objects.filter(email=data["email"]).exists():
            return {"success": False, "message": "Email already exists"}

        farmer = Farmer.objects.create(
            first_name=data.get("first_name"),
            last_name=data.get("last_name", ""),
            email=data["email"],
            role=data.get("role", "user"),
            is_google_account=data.get("is_google_account", True)
        )
        return {
            "success": True,
            "message": "User created successfully",
            "user_id": farmer.id,
            "role": farmer.role
        }
