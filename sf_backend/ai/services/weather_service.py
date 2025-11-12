import requests
from django.conf import settings

OPENWEATHER_API_KEY = settings.OPENWEATHER_API_KEY

def get_weather(lat: float, lon: float):
    """
    Trả về dữ liệu thời tiết: hiện tại + dự báo 3 ngày
    """
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric&lang=vi"
    resp = requests.get(url, timeout=10)
    
    if resp.status_code != 200:
        print("OpenWeather API error:", resp.text)
        return None

    data = resp.json()
    # Lấy giá trị hiện tại (dòng đầu tiên)
    current = data["list"][0]
    result = {
        "current": {
            "temp": current["main"]["temp"],
            "humidity": current["main"]["humidity"],
            "description": current["weather"][0]["description"],
        },
        "forecast": []
    }

    # Lấy trung bình 3 ngày tiếp theo (mỗi 8 bản ghi = 24h)
    for i in range(0, 24, 8):
        item = data["list"][i]
        result["forecast"].append({
            "date": item["dt_txt"].split(" ")[0],
            "temp": item["main"]["temp"],
            "humidity": item["main"]["humidity"],
            "rain": item.get("rain", {}).get("3h", 0),
            "description": item["weather"][0]["description"],
        })

    return result
