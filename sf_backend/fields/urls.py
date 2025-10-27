from django.urls import path
from .views import CornfieldViewSet
from rest_framework.urlpatterns import format_suffix_patterns
from .views import CornfieldViewSet, CornfieldInfoViewSet


cornfield_list = CornfieldViewSet.as_view({'get': 'list', 'post': 'create'})
cornfield_detail = CornfieldViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

cornfieldinfo_list = CornfieldInfoViewSet.as_view({'get': 'list', 'post': 'create'})
cornfieldinfo_detail = CornfieldInfoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})
cornfieldinfo_my_fields = CornfieldInfoViewSet.as_view({'get': 'my_fields'})  # custom action

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
    path('', cornfield_list, name='cornfield-list'),
    path('<int:pk>/', cornfield_detail, name='cornfield-detail'),
    
    # CornfieldInfo
    path('info/', CornfieldInfoViewSet.as_view({'get': 'list', 'post': 'create'}), name='cornfieldinfo-list'),
    path('info/<int:pk>/', CornfieldInfoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='cornfieldinfo-detail'),
    path('info/my-fields/', CornfieldInfoViewSet.as_view({'get': 'my_fields'}), name='cornfieldinfo-my-fields'),
]

# Optional: hỗ trợ suffix .json nếu cần
urlpatterns = format_suffix_patterns(urlpatterns)
