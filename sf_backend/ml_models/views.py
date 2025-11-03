# from django.views import View
# from django.http import JsonResponse
# from django.utils.decorators import method_decorator
# from django.views.decorators.csrf import csrf_exempt
# from PIL import Image
# import numpy as np
# from tensorflow.keras.applications.efficientnet import preprocess_input
# from .ml_model import MODEL

# CLASS_NAMES = ["healthy", "blast", "brown_spot", "bacterial_leaf_blight"]
# DISEASE_MAP = {
#     "healthy": "Khỏe mạnh",
#     "blast": "Đạo ôn",
#     "brown_spot": "Đốm nâu",
#     "bacterial_leaf_blight": "Cháy bìa lá"
# }

# @method_decorator(csrf_exempt, name='dispatch')
# class PredictView(View):

#     def post(self, request):
#         image = request.FILES.get("image")
#         if not image:
#             return JsonResponse({"error": "No image uploaded"}, status=400)

#         try:
#             img = Image.open(image).convert("RGB")
#             img = img.resize((224, 224))
            
#             img_array = np.array(img)
#             img_array = np.expand_dims(img_array, 0)
            
#             img_array = preprocess_input(img_array)

#             preds = MODEL.predict(img_array)
            
#             predicted_index = int(np.argmax(preds))
#             confidence = float(np.max(preds))
#             predicted_class = CLASS_NAMES[predicted_index]
#             predicted_label = DISEASE_MAP.get(predicted_class, predicted_class)

#             return JsonResponse({
#                 "predicted_index": predicted_index,
#                 "predicted_class": predicted_class,
#                 "predicted_label": predicted_label,
#                 "confidence": confidence
#             })
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)
