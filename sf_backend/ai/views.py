from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import requests
from .services.weather_service import get_weather
from .services.ai_service import generate_ai_consultation, is_agriculture_question, client

class AIChatView(APIView):
    def get_profile(self, request):
        profile_data = request.session.get("profile_data")
        if profile_data:
            return profile_data

        try:
            profile_url = f"http://localhost:8000/api/profile/"
            res = requests.get(profile_url, cookies=request.COOKIES, timeout=5)
            res.raise_for_status()
            profile_data = res.json()
        except Exception as e:
            return {"success": False, "error": f"Lỗi profile API: {e}"}

        if profile_data.get("success"):
            request.session["profile_data"] = profile_data
        return profile_data

    def post(self, request):
        user_message = request.data.get("message")
        if not user_message:
            return Response({"error": "Thiếu message"}, status=400)

        profile_data = self.get_profile(request)
        if not profile_data.get("success"):
            request.session.pop("profile_data", None)
            return Response({"error": profile_data.get("error", "Không lấy được profile")}, status=401)

        farmer_id = profile_data.get("id")
        if not farmer_id:
            return Response({"error": "Invalid profile data"}, status=401)

        if "bao nhiêu ruộng" in user_message.lower() or "tên ruộng" in user_message.lower():
            latest_url = f"{settings.INTERNAL_API_BASE}/api/observation/farmer-fields/"
            try:
                latest_resp = requests.get(latest_url, cookies=request.COOKIES, timeout=10)
                latest_resp.raise_for_status()
                latest_data = latest_resp.json()
            except requests.RequestException as e:
                return Response({"error": f"Lỗi API nội bộ: {e}"}, status=500)

            cornfields = [
                f["name"]
                for f in latest_data
                if f.get("farmer") == farmer_id
            ]
                        
            return Response({
                "success": True,
                "summary": f"Bạn có {len(cornfields)} ruộng: {', '.join(cornfields)}"
            })


        if is_agriculture_question(user_message):
            obs_url = f"{settings.INTERNAL_API_BASE}/api/observation/farmer-fields/"
            latest_url = f"{settings.INTERNAL_API_BASE}/api/cornfields/info/my-field/"

            try:
                obs_resp = requests.get(obs_url, cookies=request.COOKIES, timeout=10)
                obs_resp.raise_for_status()
                obs_data = obs_resp.json()

                latest_resp = requests.get(latest_url, cookies=request.COOKIES, timeout=10)
                latest_resp.raise_for_status()
                latest_data = latest_resp.json()
            except requests.RequestException as e:
                return Response({"error": f"Lỗi API nội bộ: {e}"}, status=500)

            responses = []
            for field in obs_data:
                if field["farmer"] != farmer_id:
                    continue
                cornfield_id = field["cornfield"]

                latest_info = next(
                    (i for i in latest_data.get("data", [])
                     if i["farmer"]["id"] == farmer_id and i["cornfield"]["id"] == cornfield_id),
                    None
                )
                if not latest_info:
                    continue

                weather_data = get_weather(latest_info.get("gps_lat"), latest_info.get("gps_lon"))
                if not weather_data:
                    continue

                ai_reply = generate_ai_consultation(field, latest_info, weather_data, user_message)
                responses.append({
                    "cornfield_id": cornfield_id,
                    "field_name": field["name"],
                    "ai_reply": ai_reply
                })

            if not responses:
                return Response({"error": "Không tìm thấy dữ liệu ruộng/bệnh"}, status=404)

            return Response({"success": True, "results": responses})

        else:
            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "Bạn là Bác sĩ lúa, trả lời bằng tiếng Việt. Có thể dùng hoặc không dùng icon."},
                        {"role": "user", "content": user_message}
                    ],
                    temperature=0.7
                )
                ai_reply = response.choices[0].message.content
            except Exception as e:
                print("GPT error:", e)
                ai_reply = "Xin lỗi, hiện mình chưa trả lời được. 😅"

            return Response({"success": True, "ai_reply": ai_reply})
