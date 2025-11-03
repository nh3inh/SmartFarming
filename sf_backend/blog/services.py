from django.core.paginator import Paginator
from django.utils import timezone
from .models import Blog

class BlogService:

    @staticmethod
    def list_blogs(page=1, page_size=6):
        """
        Lấy danh sách blog có phân trang.
        :param page: trang hiện tại (mặc định = 1)
        :param page_size: số blog mỗi trang (mặc định = 6)
        :return: dict chứa data & thông tin phân trang
        """
        blogs = Blog.objects.all().order_by('-created_at')
        paginator = Paginator(blogs, page_size)

        page_obj = paginator.get_page(page)

        return {
            "items": page_obj.object_list,   # danh sách blog của trang hiện tại
            "total": paginator.count,        # tổng số blog
            "page": page_obj.number,         # trang hiện tại
            "pages": paginator.num_pages,    # tổng số trang
            "has_next": page_obj.has_next(), # còn trang tiếp theo?
            "has_prev": page_obj.has_previous() # có trang trước?
        }

    @staticmethod
    def get_blog(blog_id):
        return Blog.objects.filter(pk=blog_id).first()

    @staticmethod
    def create_blog(data):
        return Blog.objects.create(
            title=data.get('title'),
            topic=data.get('topic'),
            image_url=data.get('image_url', ''),
            content=data.get('content'),
            viewer=data.get('viewer', 0)
        )

    @staticmethod
    def update_blog(blog_id, data):
        blog = BlogService.get_blog(blog_id)
        if not blog:
            return None
        
        fields = ['title', 'topic', 'image_url', 'content', 'viewer']
        for field in fields:
            if field in data:
                setattr(blog, field, data[field])

        blog.updated_at = timezone.now()
        blog.save()
        return blog

    @staticmethod
    def delete_blog(blog_id):
        blog = BlogService.get_blog(blog_id)
        if not blog:
            return False
        blog.delete()
        return True

    @staticmethod
    def increment_viewer(blog: Blog):
        blog.viewer += 1
        blog.save(update_fields=['viewer'])
        return blog
