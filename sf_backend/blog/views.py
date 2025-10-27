# blog/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import BlogSerializer, CommentSerializer
from .services import BlogService

class BlogViewSet(viewsets.ViewSet):

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        elif self.action in ['add_comment', 'add_like']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [AllowAny]
        return [perm() for perm in permission_classes]

    def list(self, request):
        blogs = BlogService.list_blogs()
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        blog = BlogService.get_blog(pk)
        if not blog:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        # Tăng lượt xem
        BlogService.increment_viewer(blog)

        serializer = BlogSerializer(blog)
        return Response(serializer.data)

    def create(self, request):
        blog = BlogService.create_blog(request.data)
        serializer = BlogSerializer(blog)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        blog = BlogService.update_blog(pk, request.data)
        if not blog:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = BlogSerializer(blog)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        if BlogService.delete_blog(pk):
            return Response({"status": "deleted"})
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        user = request.user
        text = request.data.get('text', '')
        comment, error = BlogService.add_comment(pk, user, text)
        if comment:
            serializer = CommentSerializer(comment)
            return Response({"status": "success", "comment": serializer.data})
        return Response({"status": "failed", "detail": error}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_like(self, request, pk=None):
        user = request.user
        total_likes = BlogService.add_like(pk, user)
        if total_likes is not None:
            return Response({"status": "success", "total_likes": total_likes})
        return Response({"status": "failed"}, status=status.HTTP_400_BAD_REQUEST)
