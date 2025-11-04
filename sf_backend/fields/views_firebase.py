import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.gis.geos import Point, GEOSGeometry
from django.conf import settings
import boto3
import json
import datetime
from .models import CornfieldInfo, Farmer, Cornfield
from django.utils import timezone
from datetime import timezone as dt_timezone
from zoneinfo import ZoneInfo
from dateutil import parser
from django.http import StreamingHttpResponse
import json
import time
import queue

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

client_queues = []

def sse_subscribe(request):
    q = queue.Queue()
    client_queues.append(q)

    def event_stream():
        try:
            while True:
                data = q.get()
                yield f"data: {json.dumps(data)}\n\n"
        except GeneratorExit:
            client_queues.remove(q)

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION_NAME,
)


@csrf_exempt
def firebase_webhook(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "Invalid method"}, status=405)

    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Invalid JSON: {str(e)}"}, status=400)

    device_id = data.get("device_id")
    gps = data.get("gps", {})
    env = data.get("env", {})
    image = data.get("image", {})
    timestamp = data.get("ts") or datetime.datetime.now().isoformat()

    gps_lat = gps.get("lat")
    gps_lon = gps.get("lon")
    gps_alt = gps.get("alt")
    gps_fix = gps.get("fix", False)
    gps_time = gps.get("time")
    gps_source = gps.get("source")

    env_ok = env.get("ok", True)
    env_time = env.get("time")
    env_port = env.get("port")
    env_source = env.get("source")
    image_url = image.get("url")

    s3_image_url = None
    if image_url:
        try:
            image_data = requests.get(image_url, timeout=15).content
            filename = f"{device_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            s3_key = f"{settings.AWS_MODEL_PATH_PL}{filename}"

            s3_client.put_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=s3_key,
                Body=image_data,
                ContentType="image/jpeg",
            )

            s3_image_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_REGION_NAME}.amazonaws.com/{s3_key}"
        except Exception as e:
            print("Upload S3 error:", e)

    disease_class = "unknown"
    confidence = 0.0
    status = 0
    try:
        ml_res = requests.post(
            "http://47.130.123.80:8000/api/ml_models/predict/",
            files={"image": requests.get(s3_image_url, stream=True).raw},
            timeout=20,
        )
        if ml_res.status_code == 200:
            ml_data = ml_res.json()
            disease_class = ml_data.get("predicted_class", "unknown")
            confidence = ml_data.get("confidence", 0.0)
            status = ml_data.get("predicted_index", 0)
        else:
            print(f"ML API returned {ml_res.status_code}: {ml_res.text}")
    except Exception as e:
        print("ML API error:", e)

    farmer_id = None
    try:
        obs_res = requests.get("http://47.130.123.80:8000/api/observation/farmer-fields/public/", timeout=10)
        if obs_res.status_code == 200:
            for field in obs_res.json():
                if field.get("iot_device_id") == device_id:
                    farmer_id = field.get("farmer")
                    break
    except Exception as e:
        print("Observation API error:", e)

    cornfield_id = None
    ms = 0.0
    if gps_lat is not None and gps_lon is not None:
        try:
            corn_res = requests.get("http://47.130.123.80:8000/api/cornfields/", timeout=10)
            if corn_res.status_code == 200:
                corn_json = corn_res.json()
                if isinstance(corn_json, dict) and "features" in corn_json:
                    cornfields = corn_json["features"]
                else:
                    cornfields = corn_json

                point = Point(float(gps_lon), float(gps_lat))
                for cf in cornfields:
                    geom_raw = cf.get("geometry")
                    geom = None
                    try:
                        if isinstance(geom_raw, str):
                            geom = GEOSGeometry(geom_raw)
                        elif isinstance(geom_raw, dict):
                            geom = GEOSGeometry(json.dumps(geom_raw))
                        else:
                            geom = GEOSGeometry(str(geom_raw))
                    except Exception as e:
                        print("Parse geometry error for feature id", cf.get("id"), ":", e)
                        geom = None

                    if geom is not None:
                        try:
                            if geom.contains(point):
                                cornfield_id = cf.get("id")
                                props = cf.get("properties") or {}
                                ms = props.get("area_m2") or props.get("area") or 0.0
                                break
                        except Exception as e:
                            print("GEOS contains check error:", e)
        except Exception as e:
            print("Cornfield API error:", e)

    def parse_firebase_time(dt):
        """Parse timestamp from Firebase, trả về VN-aware datetime"""
        if not dt:
            return None
        if isinstance(dt, str):
            try:
                dt = parser.isoparse(dt)
            except Exception:
                return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=datetime.timezone.utc)
        return dt.astimezone(VN_TZ)
    vn_now = datetime.datetime.now(VN_TZ)
    
    info = CornfieldInfo.objects.create(
        farmer_id=farmer_id,
        cornfield_id=cornfield_id,
        timestamp=parse_firebase_time(timestamp) or vn_now,
        disease_class=disease_class,
        confidence=confidence,
        ms=ms,
        image_rel=s3_image_url or "",
        gps_fix=gps_fix,
        gps_lat=gps_lat,
        gps_lon=gps_lon,
        gps_alt=gps_alt,
        gps_time=parse_firebase_time(gps_time) if gps_time else None,
        gps_source=gps_source,
        env_ok=env_ok,
        env_time=parse_firebase_time(env_time) if env_time else None,
        env_port=env_port,
        env_source=env_source,
        temp=env.get("temp"),
        hum=env.get("hum"),
        ph=env.get("ph"),
        soil=env.get("soil"),
        wind=env.get("wind"),
        wind_avg=env.get("wind_avg"),
        lux=env.get("lux"),
        status=status,
    )
    
    payload = {
    "id": info.id,
    "farmer_id": farmer_id,
    "cornfield_id": cornfield_id,
    "disease_class": disease_class,
    "confidence": confidence,
    "ms": ms,
    "image_url": s3_image_url,
    "created_at_vn": timezone.localtime(info.created_at, VN_TZ).isoformat(),
    "updated_at_vn": timezone.localtime(info.updated_at, VN_TZ).isoformat(),
    }

    for q in client_queues:
        q.put(payload)

    return JsonResponse({
        "success": True,
        "message": "CornfieldInfo created successfully",
        "id": info.id,
        "farmer_id": farmer_id,
        "cornfield_id": cornfield_id,
        "disease_class": disease_class,
        "confidence": confidence,
        "ms": ms,
        "image_url": s3_image_url,
        "created_at_vn": timezone.localtime(info.created_at, VN_TZ).isoformat(),
        "updated_at_vn": timezone.localtime(info.updated_at, VN_TZ).isoformat(),
    })
