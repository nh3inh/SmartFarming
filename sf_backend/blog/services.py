# blog/services.py
from .models import Blog, Comment, Like
from django.contrib.auth.models import User
from django.utils import timezone

class BlogService:

    @staticmethod
    def list_blogs():
        return Blog.objects.all().order_by('-created_at')

    @staticmethod
    def get_blog(blog_id):
        try:
            return Blog.objects.get(id=blog_id)
        except Blog.DoesNotExist:
            return None

    @staticmethod
    def create_blog(data):
        blog = Blog.objects.create(
            title=data.get('title'),
            topic=data.get('topic'),
            image_url=data.get('image_url', ''),
            text=data.get('text'),
            tags=data.get('tags', []),
            viewer=data.get('viewer', 0),
        )
        return blog

    @staticmethod
    def update_blog(blog_id, data):
        blog = BlogService.get_blog(blog_id)
        if not blog:
            return None
        for field in ['title', 'topic', 'image_url', 'text', 'tags', 'viewer']:
            if field in data:
                setattr(blog, field, data[field])
        blog.updated_at = timezone.now()
        blog.save()
        return blog

    @staticmethod
    def delete_blog(blog_id):
        blog = BlogService.get_blog(blog_id)
        if blog:
            blog.delete()
            return True
        return False

    @staticmethod
    def add_comment(blog_id, user, text):
        blog = BlogService.get_blog(blog_id)
        if not blog or not text:
            return None
        comment = Comment.objects.create(blog=blog, user=user, text=text)
        return comment

    @staticmethod
    def add_like(blog_id, user):
        blog = BlogService.get_blog(blog_id)
        if not blog:
            return None
        # Kiểm tra user đã like chưa
        like, created = Like.objects.get_or_create(blog=blog, user=user)
        if not created:
            return None  # đã like rồi
        return blog.likes.count()
