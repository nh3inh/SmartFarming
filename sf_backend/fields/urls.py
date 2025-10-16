from django.urls import path
from .views import CornfieldViewSet
from rest_framework.urlpatterns import format_suffix_patterns

cornfield_list = CornfieldViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

cornfield_detail = CornfieldViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('', cornfield_list, name='cornfield-list'),           # GET / POST
    path('<int:pk>/', cornfield_detail, name='cornfield-detail'),  # GET/PUT/PATCH/DELETE /<id>/
]

# Optional: hỗ trợ suffix .json nếu cần
urlpatterns = format_suffix_patterns(urlpatterns)
