from rest_framework import serializers
from .models import Blog, Comment, Like

class BlogSerializer(serializers.ModelSerializer):
    comment_count = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'topic', 'image_url', 'text', 'tags',
            'viewer', 'created_at', 'updated_at',
            'comment_count', 'like_count',
        ]

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_like_count(self, obj):
        return obj.likes.count()


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']


class LikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'created_at']
