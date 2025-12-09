from django.db import models

class Blog(models.Model):
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    image_url = models.URLField(blank=True)
    content = models.TextField()
    viewer = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

