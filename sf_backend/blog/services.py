# blog/services.py
from .models import Blog, Comment, Like
from django.utils import timezone
from django.db.models import Count

class BlogService:

    # @staticmethod
    # def list_blogs():
    #     return Blog.objects.annotate(
    #         comment_count=Count('comments'),
    #         like_count=Count('likes')
    #     ).order_by('-created_at')

    # @staticmethod
    # def get_blog(blog_id):
    #     try:
    #         return Blog.objects.get(id=blog_id)
    #     except Blog.DoesNotExist:
    #         return None

    @staticmethod
    def list_blogs():
        return (
            Blog.objects
            .annotate(
                comment_count=Count('comments', distinct=True),
                like_count=Count('likes', distinct=True)
            )
            .prefetch_related('comments', 'likes')
            .order_by('-created_at')
        )

    @staticmethod
    def get_blog(blog_id):
        try:
            return (
                Blog.objects
                .annotate(
                    comment_count=Count('comments', distinct=True),
                    like_count=Count('likes', distinct=True)
                )
                .prefetch_related('comments', 'likes')
                .get(pk=blog_id)
            )
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
        if not blog:
            return None, "Blog not found"
        if not text.strip():
            return None, "Empty comment"
        comment = Comment.objects.create(blog=blog, user=user, text=text)
        return comment, None

    @staticmethod
    def add_like(blog_id, user):
        blog = BlogService.get_blog(blog_id)
        if not blog:
            return None

        like = Like.objects.filter(blog=blog, user=user).first()
        if like:
            like.delete()  # Bỏ like
            return blog.likes.count()
        else:
            Like.objects.create(blog=blog, user=user)
            return blog.likes.count()
    
    @staticmethod
    def increment_viewer(blog):
        blog.viewer += 1
        blog.save(update_fields=['viewer'])
        return blog

