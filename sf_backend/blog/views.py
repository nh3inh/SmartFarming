from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

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
        Lấy danh sách blog có phân trang.
        Query Params: ?page=1&page_size=6
        """
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 6)

        result = BlogService.list_blogs(page, page_size)

        serializer = BlogSerializer(result["items"], many=True)

        return Response({
            "items": serializer.data,
            "total": result["total"],
            "page": result["page"],
            "pages": result["pages"],
            "has_next": result["has_next"],
            "has_prev": result["has_prev"],
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
