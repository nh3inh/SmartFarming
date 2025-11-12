from django.conf import settings
import time
import logging
from openai import OpenAI, OpenAIError, RateLimitError, APIConnectionError, APIError

logger = logging.getLogger(__name__)
client = OpenAI(api_key=settings.GPT_OPENAI_API_KEY)

def is_agriculture_question(user_message: str) -> bool:
    keywords = [
        "bệnh", "lúa", "ruộng", "thuốc", "tư vấn", "phun", "nhiệt độ",
        "độ ẩm", "phân bón", "sâu bệnh", "cây trồng", "cây lúa"
    ]
    user_message_lower = user_message.lower()
    return any(kw in user_message_lower for kw in keywords)

def generate_ai_consultation(field_data: dict, latest_info: dict, weather_data: dict, user_message: str) -> str:
    context = f"""
Bạn là "Bác sĩ Lúa" — chuyên gia chẩn đoán bệnh và tư vấn canh tác lúa.

Thông tin ruộng:
- Tên ruộng: {field_data.get('name', 'Không rõ')}
- Giống lúa: {field_data.get('crop_type', 'Không rõ')}
- Loại đất: {field_data.get('soil_type', 'Không rõ')}
- Ngày gieo trồng: {field_data.get('sowing_date', 'Không rõ')}
- Thiết bị IoT: {field_data.get('iot_device_id', 'Không rõ')}

Thông tin bệnh mới nhất:
- Loại bệnh: {latest_info.get('disease_class', 'Không xác định')}
- Mức tin cậy: {latest_info.get('confidence', 0)*100:.1f}%
- Nhiệt độ: {latest_info.get('temp', 'N/A')}°C
- Độ ẩm: {latest_info.get('hum', 'N/A')}%
- pH đất: {latest_info.get('ph', 'N/A')}
- Vị trí: {latest_info.get('gps_lat', '...')}, {latest_info.get('gps_lon', '...')}

Thời tiết hiện tại:
- {weather_data.get("current", {}).get("temp", '?')}°C, 
  {weather_data.get("current", {}).get("humidity", '?')}%, 
  {weather_data.get("current", {}).get("description", '')}

Dự báo 3 ngày tới:
"""
    for day in weather_data.get("forecast", []):
        context += (
            f"  + {day['date']}: {day['temp']}°C, ẩm {day['humidity']}%, "
            f"mưa {day.get('rain', 0)}mm, {day['description']}\n"
        )

    context += f"""

Người dùng hỏi: "{user_message}"

Nhiệm vụ của bạn:
1. Đánh giá ngắn gọn tình hình ruộng dựa trên dữ liệu và thời tiết
2. Đề xuất loại thuốc phù hợp với bệnh và cách sử dụng
3. Đề xuất hành động phù hợp với tình hình ruộng và thời tiết sắp tới
4. Giải thích rõ ràng, thực tế, tránh dài dòng, có thể dùng emoji phù hợp, Trả lời tiếng Việt
"""

    user_content = [{"type": "text", "text": context}]
    retries = 3
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Bạn là Bác sĩ Lúa – chuyên gia nông nghiệp thân thiện, giải thích ngắn gọn và chính xác."
                    },
                    {"role": "user", "content": user_content}
                ],
                temperature=0.7,
                max_tokens=600
            )
            
            print(f"Prompt tokens: {response.usage.prompt_tokens}")
            print(f"Completion tokens: {response.usage.completion_tokens}")
            print(f"Total tokens: {response.usage.total_tokens}")

            reply = response.choices[0].message.content.strip()
            return reply or "Bác sĩ chưa có câu trả lời cụ thể, vui lòng thử lại nhé 🌱"

        except RateLimitError:
            wait_time = (attempt + 1) * 10
            logger.warning(f"⚠️ Rate limit hit — retrying in {wait_time}s...")
            time.sleep(wait_time)
        except (APIConnectionError, APIError) as e:
            logger.error(f"🚨 OpenAI API error: {e}")
            if attempt < retries - 1:
                time.sleep(3)
            else:
                return "Máy chủ AI đang bận hoặc mất kết nối 😢, vui lòng thử lại sau nhé."
        except OpenAIError as e:
            logger.exception(f"❌ Lỗi OpenAI: {e}")
            return "Có lỗi xảy ra khi sinh tư vấn, vui lòng thử lại sau nhé 😅"
        except Exception as e:
            logger.exception(f"❌ Lỗi không xác định: {e}")
            return "Có lỗi xảy ra khi sinh tư vấn, vui lòng thử lại sau nhé 😅"

    return "Hệ thống AI tạm quá tải 😓, hãy thử lại sau vài phút nhé."