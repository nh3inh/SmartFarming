from rest_framework import serializers
from .models import Blog

class BlogSerializer(serializers.ModelSerializer):

    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'topic', 'image_url', 'content',
            'viewer', 'created_at', 'updated_at'
        ]


