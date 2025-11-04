from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage
from .models import Blog
from .serializers import BlogSerializer

from .serializers import BlogSerializer
from .services import BlogService


class BlogViewSet(viewsets.ViewSet):
    """
    API ViewSet cho Blog.
    - Ai cũng xem được danh sách & chi tiết blog
    - Chỉ Admin mới được tạo / sửa / xóa
    """

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]   # chỉ admin được phép
        else:
            permission_classes = [AllowAny]      # công khai
        return [perm() for perm in permission_classes]

    def list(self, request):
        """
        API phân trang Blog
        Query Params:
        - page: số trang (mặc định = 1)
        - page_size: số item mỗi trang (mặc định = 6)
        """

        try:
            page = int(request.GET.get('page', 1))
        except:
            page = 1

        try:
            page_size = int(request.GET.get('page_size', 6))
        except:
            page_size = 6

        blogs = Blog.objects.all().order_by('-created_at')
        paginator = Paginator(blogs, page_size)

        try:
            page_obj = paginator.page(page)
        except EmptyPage:
            page = 1
            page_obj = paginator.page(page)

        serializer = BlogSerializer(page_obj.object_list, many=True)

        return Response({
            "items": serializer.data,
            "total": paginator.count,
            "page": page,
            "pages": paginator.num_pages,
            "has_next": page_obj.has_next(),
            "has_prev": page_obj.has_previous()
        })

    def retrieve(self, request, pk=None):
        """
        Lấy chi tiết blog theo ID và tự động tăng lượt xem.
        """
        blog = BlogService.get_blog(pk)
        if not blog:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        BlogService.increment_viewer(blog)
        serializer = BlogSerializer(blog)
        return Response(serializer.data)

    def create(self, request):
        """
        Tạo blog mới.
        Chỉ Admin được phép.
        """
        blog = BlogService.create_blog(request.data)
        serializer = BlogSerializer(blog)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        """
        Cập nhật blog theo ID.
        Chỉ Admin được phép.
        """
        blog = BlogService.update_blog(pk, request.data)
        if not blog:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BlogSerializer(blog)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        """
        Xóa blog theo ID.
        Chỉ Admin được phép.
        """
        deleted = BlogService.delete_blog(pk)
        if not deleted:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"status": "deleted"}, status=status.HTTP_200_OK)
