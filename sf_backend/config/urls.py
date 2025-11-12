"""
URL configuration for SmartFarming project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from _auth import urls as auth_urls
from _profile import urls as profile_urls
from contact import urls as contact_urls
from blog import urls as blog_urls
from observation import urls as observation_urls
from ml_models import urls as ml_model_urls
from ai import urls as ai_urls

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include(auth_urls.urlpatterns)),
    path("api/profile/", include(profile_urls.urlpatterns)),
    path("api/contact/", include(contact_urls.urlpatterns)),
    path("api/cornfields/", include("fields.urls")),
    path("api/blog/", include('blog.urls')),
    path("api/observation/", include("observation.urls")),
    path("api/ml_models/", include("ml_models.urls")),
    path("api/ai/", include("ai.urls")),
]
