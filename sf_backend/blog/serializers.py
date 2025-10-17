# blog/serializers.py
from rest_framework import serializers
from .models import Blog, Comment, Like
from django.contrib.auth.models import User

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['user', 'text', 'created_at']

class BlogSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    total_likes = serializers.IntegerField(source='likes.count', read_only=True)

    class Meta:
        model = Blog
        fields = '__all__'
