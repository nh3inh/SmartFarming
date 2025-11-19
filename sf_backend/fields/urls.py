from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from .views import FarmerViewSet, CornfieldViewSet, CornfieldInfoViewSet
from . import views_firebase, views_analyze

farmer_list = FarmerViewSet.as_view({'get': 'list'})
farmer_detail = FarmerViewSet.as_view({'get': 'retrieve'})

cornfield_list = CornfieldViewSet.as_view({'get': 'list', 'post': 'create'})
cornfield_detail = CornfieldViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

cornfieldinfo_list = CornfieldInfoViewSet.as_view({'get': 'list', 'post': 'create'})
cornfieldinfo_detail = CornfieldInfoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})
cornfieldinfo_my_fields = CornfieldInfoViewSet.as_view({'get': 'my_fields'})

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
    # Farmer
    path('farmers/', farmer_list, name='farmer-list'),
    path('farmers/<int:pk>/', farmer_detail, name='farmer-detail'),
    
    # Cornfield
    path('', cornfield_list, name='cornfield-list'),
    path('<int:pk>/', cornfield_detail, name='cornfield-detail'),
    
    # CornfieldInfo
    path('info/', CornfieldInfoViewSet.as_view({'get': 'list', 'post': 'create'}), name='cornfieldinfo-list'),
    path('info/<int:pk>/', CornfieldInfoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='cornfieldinfo-detail'),
    path('info/my-fields/', CornfieldInfoViewSet.as_view({'get': 'my_fields'}), name='cornfieldinfo-my-fields'),
    path('info/my-field/', CornfieldInfoViewSet.as_view({'get': 'latest_fields'}), name='cornfieldinfo-my-field'),
    path('info/public/', CornfieldInfoViewSet.as_view({'get': 'earliest_fields_public'}), name='cornfieldinfo-fields-public'),
    
    # Firebase webhook
    path('firebase-webhook/', views_firebase.firebase_webhook, name='firebase_webhook'),
    path('info/analyze-image/', views_analyze.analyze_image, name="analyze_image"),
    
    # SSE subscribe
    path('sse/subscribe/', views_firebase.sse_subscribe, name='sse_subscribe'),
]

# Optional: hỗ trợ suffix .json nếu cần
urlpatterns = format_suffix_patterns(urlpatterns)
