from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogViewSet

router = DefaultRouter()
router.register(r'list_blog', BlogViewSet, basename='blog')

urlpatterns = router.urls