from django.conf import settings
from rest_framework.views import APIView
from django.http import JsonResponse

from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
import json


@csrf_exempt
def contact_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email")
        content = data.get("content")

        subject = f"[Contact Form] {name}"
        message = f"""
        Information from Contact Form:
        👤 Name: {name}
        📞 Phone: {phone}
        📧 Email: {email}
        📝 Message:
        {content}
        """

        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [settings.EMAIL_RECEIVER],
                fail_silently=False,
            )
            return JsonResponse({"status": "success", "message": "Email sent!"})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=400)