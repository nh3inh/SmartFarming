from django.conf import settings
import time
import logging
import re
from openai import OpenAI, OpenAIError, RateLimitError, APIConnectionError, APIError

logger = logging.getLogger(__name__)
client = OpenAI(api_key=settings.GPT_OPENAI_API_KEY)

AGRI_RULES = {
    "disease": [
        ["Đề xuất", "vàng", "cháy", "đốm", "héo", "úa", "thối", "bệnh"],
        ["liệu trình", "nấm", "vi khuẩn", "virus", "rầy", "đạo ôn", "sâu"],
        ["chữa bệnh", "phòng", "phun", "thuốc", "xử lý", "trị"],
    ],
    "environment": [
        ["Tư vấn", "mưa", "nắng", "bão", "nhiệt độ", "độ ẩm"],
        ["thời tiết", "mực nước", "tưới", "thoát nước", "ngập", "khô hạn"],
        ["ruộng lúa", "nên", "điều chỉnh", "ứng phó", "biện pháp"],
    ],
    "fertilizer": [
        ["Đề xuất", "phân", "npk", "ure", "kali", "hữu cơ"],
        ["phân bón", "bón thúc", "bón lót", "đẻ nhánh", "làm đòng"],
        ["cho ruộng", "liều", "cách bón", "nên dùng", "tư vấn"],
    ],
    "action_plan": [
        ["Tư vấn", "kế hoạch", "cần làm gì", "tiếp theo", "xử lý"],
        ["lịch trình", "hôm nay", "ngày mai", "2 ngày", "1 tuần", "7 ngày", "14 ngày"],
        ["canh tác", "nước", "phân", "phun", "bệnh", "thời tiết"],
    ],
}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", "", text.lower())


def match_groups(user_message: str, groups: list[list[str]]) -> bool:
    msg = normalize_text(user_message)
    for group in groups:
        if not any(normalize_text(keyword) in msg for keyword in group):
            return False
    return True


def analyze_intent_with_ai(user_message: str) -> str:
    """
    Dùng GPT để phân loại câu hỏi nếu từ khóa không bắt được.
    Trả về: 'disease', 'environment', 'fertilizer', 'action_plan' hoặc 'general'
    """
    system_prompt = """
    Bạn là bộ phân loại ý định cho ứng dụng 'Bác sĩ Lúa'.
    Hãy phân loại câu hỏi người dùng vào 1 trong 4 nhóm sau:
    1. 'disease': Hỏi về sâu bệnh, lá vàng, đốm, nấm, côn trùng, cách trị bệnh.
    2. 'environment': Hỏi về thời tiết, mưa nắng, ngập nước, khô hạn, đất đai.
    3. 'fertilizer': Hỏi về phân bón, dinh dưỡng, cách bón phân.
    4. 'action_plan': Hỏi về lịch trình canh tác, kế hoạch làm gì tiếp theo.
    
    Nếu câu hỏi là chào hỏi xã giao, hoặc không liên quan kỹ thuật lúa: trả về 'general'.
    CHỈ TRẢ VỀ ĐÚNG 1 TỪ KẾT QUẢ (không giải thích).
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0,
            max_tokens=10,
        )
        intent = response.choices[0].message.content.strip().lower()

        valid_intents = ["disease", "environment", "fertilizer", "action_plan"]
        if intent in valid_intents:
            return intent
        return "general"

    except Exception as e:
        logger.error(f"Lỗi phân loại AI: {e}")
        return "general"


def classify_agriculture_question(user_message: str):
    for key, groups in AGRI_RULES.items():
        if match_groups(user_message, groups):
            return key

    if len(user_message.split()) > 2:
        ai_intent = analyze_intent_with_ai(user_message)
        if ai_intent != "general":
            return ai_intent

    return None


def is_agriculture_question(user_message: str) -> bool:
    return classify_agriculture_question(user_message) is not None


def _call_ai_system(
    system_prompt: str, user_prompt: str, history: list = [], max_tokens: int = 400
) -> str:
    retries = 3

    messages_payload = [{"role": "system", "content": system_prompt}]

    if history:
        messages_payload.extend(history)

    messages_payload.append({"role": "user", "content": user_prompt})

    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=messages_payload,
                temperature=0.6,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content.strip()
        except RateLimitError:
            wait_time = (attempt + 1) * 5
            logger.warning(f"Rate limit hit — retrying in {wait_time}s...")
            time.sleep(wait_time)
        except (APIConnectionError, APIError) as e:
            logger.error(f"OpenAI API error: {e}")
            if attempt < retries - 1:
                time.sleep(2)
            else:
                return "Máy chủ AI đang bận hoặc mất kết nối, vui lòng thử lại sau."
        except OpenAIError as e:
            logger.exception(f"OpenAI error: {e}")
            return "Có lỗi khi sinh câu trả lời AI, vui lòng thử lại sau."
        except Exception as e:
            logger.exception(f"Unknown error: {e}")
            return "Lỗi không xác định khi tạo tư vấn AI."
    return "Hệ thống AI tạm thời quá tải."


def generate_ai_consultation(
    field_data: dict,
    latest_info: dict,
    weather_data: dict,
    user_message: str,
    history: list = [],
) -> str:
    area_m2 = (
        latest_info.get("cornfield", {}).get("properties", {}).get("area_m2", "N/A")
    )
    area_cong = round(area_m2 / 100, 2) if area_m2 != "N/A" else "N/A"

    DISEASE_LABELS = {
        "healthy": "Khỏe mạnh",
        "blast": "Đạo ôn",
        "brown_spot": "Đốm nâu",
        "bacterial_leaf_blight": "Cháy bìa lá",
    }
    loai_benh = DISEASE_LABELS.get(
        latest_info.get("disease_class", ""), "Không xác định"
    )

    context = f"""
Bạn là "Bác sĩ Lúa" — chuyên gia chẩn đoán bệnh và tư vấn canh tác lúa.

Thông tin ruộng:
- Tên ruộng: {field_data.get('name', 'Không rõ')}
- Giống lúa: {field_data.get('crop_type', 'Không rõ')}
- Loại đất: {field_data.get('soil_type', 'Không rõ')}
- Diện tích: {area_m2} m² ({area_cong} công)
- Ngày gieo trồng: {field_data.get('sowing_date', 'Không rõ')}
- Thiết bị IoT: {field_data.get('iot_device_id', 'Không rõ')}

Thông tin bệnh mới nhất:
- Loại bệnh: {loai_benh}
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
Sau khi đánh giá tình hình ruộng và bệnh, bạn phải đưa ra một kế hoạch hành động chi tiết để nông dân có thể thực hiện ngay trong thực tế.
Kế hoạch trả lời thuộc loại KẾ HOẠCH NGẮN HẠN, nghĩa là các hành động cần thực hiện trong 1–14 ngày tới. Vì vậy, mọi hướng dẫn phải nêu rõ:
- Hành động cần làm ngay (0–24 giờ)
- Hành động trong những ngày tiếp theo (2–7 ngày)
- Hành động lặp lại hoặc kiểm tra lại (7–14 ngày)
Kế hoạch phải trình bày bằng NGÔN NGỮ TỰ NHIÊN (không dùng JSON), nhưng phải bao gồm các mức độ cụ thể giống như các payload mẫu:
1. Xem xét tất cả tiêu chí (nhiệt độ, độ ẩm không khí, độ pH, độ ẩm đất, gió hiện tại, gió trung bình, ánh sáng) hiện tại xem có tiêu chí nào đang quá cao hoặc quá thấp, tiêu chí nào ảnh hưởng đến quá trình phát triển quá trình phát triển của lúa hay không? Nếu có đưa ra giải pháp:
   - So sánh hiện tại và các ngày sau đó
   - Khi nào nên thao tác
   - Thao tác như thế nào
   - Tăng/giảm trong bao lâu
   - Có điểm gì cần lưu ý
   - Nếu có thời điểm gợi ý, phải nêu ví dụ: "sáng mai trước 9h", "sau mưa 2–3 giờ"
2. Hướng dẫn xử lý bệnh bằng thuốc:
   - Tên thương mại của thuốc
   - Hoạt chất
   - Liều lượng chính xác (gram/gói/ml)
   - Lượng nước cần pha
   - Cách pha
   - Thời điểm phun (sáng/chiều)
   - Điều kiện tránh phun (mưa, nắng gắt)
   - Số lần phun và khoảng cách giữa các lần
   - Ghi chú thời hạn: phun lặp lại trong vòng 7–10 ngày
3. Kế hoạch phục hồi dinh dưỡng sau xử lý bệnh:
   - Loại phân (NPK, hữu cơ…)
   - Lượng bón (kg/sào hoặc ha)
   - Cách bón hoặc hòa tan
   - Lưu ý thời tiết khi bón
   - Khi nào bắt đầu bón lại sau khi phun thuốc
Cách viết:
- Trả lời dưới 800 token
- Diễn đạt rõ ràng, thực tế, dễ hiểu cho nông dân.
- Dùng giọng thân thiện, có emoji nhẹ nhàng.
- Tránh viết dài dòng, nhưng phải đủ chi tiết để người nông dân làm theo được ngay.
- Không tóm tắt chung chung.
- Ưu tiên đưa ra thời điểm cụ thể (ví dụ: sáng mai 6–7h, sau mưa 2–3 giờ…).
- Luôn nhắc mốc thời gian để nông dân biết đây là kế hoạch NGẮN HẠN 1–14 ngày.
"""
    system_prompt = "Bạn là Bác sĩ Lúa – chuyên gia nông nghiệp thân thiện, giải thích ngắn gọn và chính xác."

    return _call_ai_system(system_prompt, context, history=history, max_tokens=820)


def generate_disease_advice(
    field_data: dict,
    latest_info: dict,
    weather_data: dict,
    user_message: str,
    history: list = [],
) -> str:
    system = "Bạn là Bác sĩ Lúa — chuyên gia xử lý sâu bệnh. Viết ngắn gọn, thực tế, ưu tiên hành động 0-24h, 2-7 ngày, 7-14 ngày."
    user = f"""
Thông tin ruộng: tên={field_data.get('name')}, giống={field_data.get('crop_type')}, iot={field_data.get('iot_device_id')}
Báo cáo mới nhất: bệnh={latest_info.get('disease_class')}, confidence={latest_info.get('confidence',0)}
Khung thời tiết hiện tại: temp={weather_data.get('current',{}).get('temp')}°C, hum={weather_data.get('current',{}).get('humidity')}%
Người dùng hỏi: "{user_message}"

Yêu cầu trả lời:
1) Chẩn đoán ngắn (1-2 câu).
2) Hành động ngay (0–24h): thao tác cụ thể + liệt kê thuốc (tên thương mại | hoạt chất | liều | lượng nước | cách pha | thời điểm phun | điều kiện tránh).
3) Hành động 2–7 ngày: theo dõi, phun lặp, tiêu chuẩn dừng,...
4) Hành động 7–14 ngày: phục hồi dinh dưỡng, kiểm tra,...
5) Ghi chú an toàn (PPE), thời gian cách ly thu hoạch nếu có.
6) Trả lời dưới 500 token
Trả bằng tiếng Việt, rõ ràng, có bullet/ngắt dòng, dùng emoji nhẹ nhàng.
"""
    return _call_ai_system(system, user, history=history, max_tokens=520)


def generate_environment_advice(
    field_data: dict,
    latest_info: dict,
    weather_data: dict,
    user_message: str,
    history: list = [],
) -> str:
    system = "Bạn là Bác sĩ Lúa — chuyên gia về quản lý các chỉ số môi trường và ứng phó thời tiết. Hướng dẫn rõ ràng, hành động cụ thể."
    user = f"""
Ruộng: {field_data.get('name')} - vị trí {latest_info.get('gps_lat')},{latest_info.get('gps_lon')}
Thời tiết hiện tại & dự báo: {weather_data.get('current')} ; forecast: {weather_data.get('forecast', [])}
Người dùng hỏi: "{user_message}"

Yêu cầu:
1) Đánh giá rủi ro môi trường ngay (mực nước/khô/hạn/mưa/bão/các chỉ số môi trường).
2) Hành động khẩn cấp 0–24h (ví dụ: mở/đóng cống, bơm/thoát nước, di dời vật tư,...).
3) Kế hoạch 2–7 ngày: cân bằng mực nước, lịch tưới, tránh phun thuốc lúc mưa,...
4) Khuyến nghị phòng ngừa lâu hơn (che phủ, đê, lịch canh tác,...).
5) Trả lời dưới 500 token
Trả tiếng Việt thực tế, ghi rõ thời điểm (sáng/chiều/ngày cụ thể), nếu có số đo hãy nêu (cm, giờ).
"""
    return _call_ai_system(system, user, history=history, max_tokens=520)


def generate_fertilizer_advice(
    field_data: dict,
    latest_info: dict,
    weather_data: dict,
    user_message: str,
    history: list = [],
) -> str:
    system = "Bạn là Bác sĩ Lúa — chuyên gia dinh dưỡng cây trồng. Cho khuyến nghị cụ thể cho ruộng (ruộng có thể có bệnh nên cần chú ý), ưu tiên thực tế cho nông dân."
    user = f"""
Ruộng: {field_data.get('name')}, giống={field_data.get('crop_type')}
Dữ liệu: latest_info={latest_info}, thời tiết hiện tại={weather_data.get('current')}
Người dùng hỏi: "{user_message}"

Yêu cầu:
1) Nếu cần: đề xuất loại phân (NPK, urê, kali, hữu cơ,...) và hoạt chất/trộn.
2) Đề xuất liều tham khảo (kg/ha và kg/công nếu có thể).
3) Cách bón (rải, hòa tan, phun lá), lượng nước khi hòa.
4) Thời điểm bón (sáng/chiều/giai đoạn sinh trưởng).
5) Lưu ý tương tác với thuốc bảo vệ thực vật và thời tiết (mưa, nắng).
6) Trả lời dưới 500 token
Trả bằng tiếng Việt, ngắn gọn, có bullet points và mốc thời gian.
"""
    return _call_ai_system(system, user, history=history, max_tokens=520)
