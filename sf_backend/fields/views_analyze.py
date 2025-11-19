import requests
import datetime
import json
import os
import boto3
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from zoneinfo import ZoneInfo
from django.contrib.gis.geos import Point
from dateutil import parser
from .models import CornfieldInfo

INTERNAL_API_BASE = os.getenv("INTERNAL_API_BASE")

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION_NAME,
)


def upload_image_to_s3(file_bytes, farmer_id, cornfield_id):
    filename = f"{farmer_id}_{cornfield_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
    s3_key = f"{settings.AWS_MODEL_PATH_PL}{filename}"

    s3_client.put_object(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        Key=s3_key,
        Body=file_bytes,
        ContentType="image/jpeg",
    )

    return f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_REGION_NAME}.amazonaws.com/{s3_key}"


def parse_time(dt):
    if not dt:
        return datetime.datetime.now(VN_TZ)
    if isinstance(dt, str):
        dt = parser.isoparse(dt)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.timezone.utc)
    return dt.astimezone(VN_TZ)


@csrf_exempt
def analyze_image(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "Invalid method"}, status=405)

    try:
        farmer_id = int(request.POST.get("farmer_id"))
        cornfield_id = int(request.POST.get("cornfield_id"))
        image_file = request.FILES["image"]
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Invalid input: {e}"}, status=400)

    image_bytes = image_file.read()

    s3_url = upload_image_to_s3(image_bytes, farmer_id, cornfield_id)
    try:
        ml_res = requests.post(
            f"{settings.INTERNAL_API_BASE}/api/ml_models/predict/",
            files={"image": image_bytes},
            timeout=15
        )
        ml_json = ml_res.json()
        disease_class = ml_json.get("predicted_class", "unknown")
        confidence = ml_json.get("confidence", 0.0)
        status = ml_json.get("predicted_index", 0)

    except Exception as e:
        print("ML error:", e)
        disease_class = "unknown"
        confidence = 0.0
        status = 0

    latest = (
        CornfieldInfo.objects
        .filter(farmer_id=farmer_id, cornfield_id=cornfield_id)
        .order_by("-created_at")
        .first()
    )

    if latest is None:
        return JsonResponse({
            "success": False,
            "message": "Không tìm thấy bản ghi để cập nhật"
        }, status=404)

    latest.image_rel = s3_url
    latest.disease_class = disease_class
    latest.confidence = confidence
    latest.status = status
    latest.timestamp = datetime.datetime.now(VN_TZ)
    latest.save()

    return JsonResponse({
        "success": True,
        "message": "Updated existing field record",
        "id": latest.id,
        "image_url": s3_url,
        "disease_class": disease_class,
        "confidence": confidence,
        "status": status,
        "updated_at": latest.updated_at.isoformat()
    })
