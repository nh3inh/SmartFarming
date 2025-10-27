from django.db import models
# from django.contrib.auth.models import fields_farmer
# from  import Farmer

class Blog(models.Model):
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    image_url = models.URLField(blank=True)
    text = models.TextField()
    tags = models.JSONField(default=list, blank=True)
    viewer = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    # @property
    # def comment_count(self):
    #     """Đếm số lượng comment"""
    #     return self.comments.count()

    # @property
    # def like_count(self):
    #     """Đếm số lượng like"""
    #     return self.likes.count()


class Comment(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
    # user = models.ForeignKey(Farmer, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} - {self.blog.title}'


class Like(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='likes')
    # user = models.ForeignKey(Farmer, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    # class Meta:
    #     unique_together = ('blog', 'user')  # mỗi user chỉ like 1 lần mỗi blog

    # def __str__(self):
    #     return f'{self.user.username} liked {self.blog.title}'
