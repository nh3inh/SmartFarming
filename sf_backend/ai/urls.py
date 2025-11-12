from django.urls import path
from .views import AIChatView

urlpatterns = [
    path('consultation/', AIChatView.as_view(), name='ai_consultation'),
]
