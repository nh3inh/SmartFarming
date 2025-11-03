# import os
# import boto3
# import tensorflow as tf
# from django.conf import settings

# # Thư mục chứa model local
# LOCAL_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ml_models")
# LOCAL_MODEL_PATH = os.path.join(LOCAL_MODEL_DIR, "efficientnet_model.keras")

# def download_model():
#     """Download the model from AWS S3 if it doesn't exist locally."""
#     os.makedirs(LOCAL_MODEL_DIR, exist_ok=True)

#     if not os.path.exists(LOCAL_MODEL_PATH):
#         s3 = boto3.client(
#             "s3",
#             aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
#             aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
#             region_name=getattr(settings, "AWS_REGION_NAME", None)
#         )
#         s3.download_file(
#             settings.AWS_STORAGE_BUCKET_NAME,
#             settings.AWS_MODEL_PATH,
#             LOCAL_MODEL_PATH
#         )
#         print(f"Model downloaded to {LOCAL_MODEL_PATH}")
#     else:
#         print(f"Model already exists at {LOCAL_MODEL_PATH}")

#     return LOCAL_MODEL_PATH

# MODEL_PATH = download_model()
# MODEL = tf.keras.models.load_model(MODEL_PATH)
# print("EfficientNet model loaded and ready")
