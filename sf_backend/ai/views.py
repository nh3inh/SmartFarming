from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import requests
from django.core.cache import cache
from .services.weather_service import get_weather
from .services.ai_service import (
    client,
    generate_ai_consultation,
    generate_disease_advice,
    generate_environment_advice,
    generate_fertilizer_advice,
    classify_agriculture_question,
)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class AIChatView(APIView):
    def get_profile(self, request):
        profile_data = request.session.get("profile_data")
        if profile_data:
            return profile_data
        
        try:
            profile_url = f"{settings.INTERNAL_API_BASE}/api/profile/"
            res = requests.get(profile_url, cookies=request.COOKIES, timeout=5)
            if res.status_code == 200:
                profile_data = res.json()
                if profile_data.get("success"):
                    request.session["profile_data"] = profile_data
                    return profile_data
        except Exception:
            pass
        
        return {"success": False}

    def post(self, request):
        user_message = request.data.get("message")
        if not user_message:
            return Response({"error": "Thiếu message"}, status=400)

        profile_data = self.get_profile(request)
        is_authenticated = profile_data.get("success", False)
        
        if is_authenticated:
            user_id = profile_data.get("id")
            limit_key = f"chat_limit_user_{user_id}"
            daily_limit = 20
        else:
            user_ip = get_client_ip(request)
            limit_key = f"chat_limit_guest_{user_ip}"
            daily_limit = 3

        current_usage = cache.get(limit_key, 0)

        if current_usage >= daily_limit:
            msg = (
                "Bạn đã hết 20 lượt tư vấn hôm nay. Mai quay lại nhé! 🌾" 
                if is_authenticated 
                else "Bạn đã hết 3 lượt hỏi miễn phí. Hãy Đăng nhập để được hỏi 20 câu/ngày nhé! 🌾"
            )
            return Response({"success": False, "error": msg}, status=200)

        chat_history = request.session.get("chat_history", [])
        
        response_data = None
        ai_reply_result = ""

        if is_authenticated:
            farmer_id = profile_data.get("id")

            if "bao nhiêu ruộng" in user_message.lower() or "tên ruộng của" in user_message.lower() or "mấy thửa ruộng" in user_message.lower() or "bao nhiêu thửa ruộng" in user_message.lower():
                try:
                    latest_url = f"{settings.INTERNAL_API_BASE}/api/observation/farmer-fields/"
                    latest_resp = requests.get(latest_url, cookies=request.COOKIES, timeout=10)
                    latest_resp.raise_for_status()
                    latest_data = latest_resp.json()
                    
                    cornfields = [f["name"] for f in latest_data if f.get("farmer") == farmer_id]
                    
                    if not cornfields:
                        response_data = {"success": False, "error": "Bạn hiện chưa có ruộng nào."}
                    else:
                        summary_text = f"Bạn có {len(cornfields)} ruộng: {', '.join(cornfields)}"
                        response_data = {"success": True, "summary": summary_text}
                        ai_reply_result = summary_text
                except Exception as e:
                    return Response({"error": f"Lỗi API nội bộ: {e}"}, status=500)

            if not response_data:
                category = classify_agriculture_question(user_message)
                if category:
                    try:
                        obs_url = f"{settings.INTERNAL_API_BASE}/api/observation/farmer-fields/"
                        info_url = f"{settings.INTERNAL_API_BASE}/api/cornfields/info/my-field/"
                        
                        obs_resp = requests.get(obs_url, cookies=request.COOKIES, timeout=10)
                        info_resp = requests.get(info_url, cookies=request.COOKIES, timeout=10)
                        
                        if obs_resp.status_code == 200 and info_resp.status_code == 200:
                            obs_data = obs_resp.json()
                            latest_data = info_resp.json()
                            
                            responses = []
                            for field in obs_data:
                                if field["farmer"] != farmer_id: continue
                                
                                cornfield_id = field["cornfield"]
                                latest_info = next((i for i in latest_data.get("data", []) 
                                                  if i["farmer"]["id"] == farmer_id and i["cornfield"]["id"] == cornfield_id), None)
                                
                                if not latest_info: continue

                                weather_data = get_weather(latest_info.get("gps_lat"), latest_info.get("gps_lon"))
                                if not weather_data: continue

                                if category == "disease":
                                    ai_reply = generate_disease_advice(field, latest_info, weather_data, user_message, history=chat_history)
                                elif category == "environment":
                                    ai_reply = generate_environment_advice(field, latest_info, weather_data, user_message, history=chat_history)
                                elif category == "fertilizer":
                                    ai_reply = generate_fertilizer_advice(field, latest_info, weather_data, user_message, history=chat_history)
                                else:
                                    ai_reply = generate_ai_consultation(field, latest_info, weather_data, user_message, history=chat_history)

                                responses.append({
                                    "cornfield_id": cornfield_id,
                                    "field_name": field["name"],
                                    "ai_reply": ai_reply,
                                })
                                
                                if not ai_reply_result:
                                    ai_reply_result = ai_reply

                            if responses:
                                response_data = {"success": True, "results": responses}
                            else:
                                response_data = {"success": False, "error": "Chưa có dữ liệu chi tiết về ruộng/bệnh để tư vấn."}
                        else:
                             response_data = {"success": False, "error": "Không lấy được dữ liệu ruộng."}
                    except Exception as e:
                        print(f"Error fetching agri data: {e}")
                        pass

        if not response_data:
            try:
                messages_payload = [
                    {
                        "role": "system",
                        "content": "Bạn là Bác sĩ lúa, chuyên gia nông nghiệp thân thiện. Trả lời ngắn gọn bằng tiếng Việt.",
                    }
                ]
                if chat_history:
                    messages_payload.extend(chat_history)
                
                messages_payload.append({"role": "user", "content": user_message})

                response = client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=messages_payload,
                    temperature=0.7,
                )
                ai_reply_result = response.choices[0].message.content
                response_data = {"success": True, "ai_reply": ai_reply_result}

            except Exception as e:
                print("GPT error:", e)
                response_data = {"success": True, "ai_reply": "Xin lỗi, hiện hệ thống đang bận. Bạn thử lại sau nhé! 😅"}
                ai_reply_result = response_data["ai_reply"]

        if response_data.get("success"):
            if cache.get(limit_key) is None:
                cache.set(limit_key, 1, timeout=86400)
            else:
                cache.incr(limit_key)

            if ai_reply_result:
                new_turn = [
                    {"role": "user", "content": user_message},
                    {"role": "assistant", "content": ai_reply_result}
                ]
                updated_history = (chat_history + new_turn)[-6:]
                request.session["chat_history"] = updated_history

        return Response(response_data)