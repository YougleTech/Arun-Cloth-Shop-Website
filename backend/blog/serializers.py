from rest_framework import serializers
from .models import BlogPost, BlogCategory, BlogComment


class BlogCategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.ReadOnlyField()

    class Meta:
        model = BlogCategory
        fields = [
            'id', 'name', 'slug', 'description', 
            'is_active', 'posts_count'
        ]
        read_only_fields = ['id', 'slug', 'posts_count']


class BlogCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = [
            'id', 'post', 'author_name', 'author_email', 
            'content', 'is_approved', 'created_at'
        ]
        read_only_fields = ['id', 'is_approved', 'created_at']


class BlogPostListSerializer(serializers.ModelSerializer):
    """Serializer for blog post list view (lighter data)"""
    author_name = serializers.ReadOnlyField()
    tags = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'author', 'author_name', 'category', 'category_name',
            'tags', 'is_published', 'is_featured', 'views_count',
            'created_at', 'updated_at', 'published_at',
            'meta_title', 'meta_description'
        ]
        read_only_fields = [
            'id', 'slug', 'author_name', 'category_name', 
            'views_count', 'created_at', 'updated_at'
        ]

    def get_tags(self, obj):
        return obj.tags_list


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Serializer for blog post detail view (full data)"""
    author_name = serializers.ReadOnlyField()
    tags = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'featured_image',
            'author', 'author_name', 'category', 'category_name',
            'tags', 'is_published', 'is_featured', 'views_count',
            'created_at', 'updated_at', 'published_at',
            'meta_title', 'meta_description', 'comments_count'
        ]
        read_only_fields = [
            'id', 'slug', 'author_name', 'category_name', 
            'views_count', 'created_at', 'updated_at', 'comments_count'
        ]

    def get_tags(self, obj):
        return obj.tags_list

    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()


class BlogPostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating blog posts"""
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = BlogPost
        fields = [
            'title', 'excerpt', 'content', 'featured_image',
            'category', 'tags', 'is_published', 'is_featured',
            'meta_title', 'meta_description'
        ]

    def validate_tags(self, value):
        """Convert list of tags to comma-separated string"""
        if isinstance(value, list):
            return ', '.join(value)
        return value

    def create(self, validated_data):
        # Set the author to the current user
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Don't allow changing the author
        validated_data.pop('author', None)
        return super().update(instance, validated_data)


class AddCommentSerializer(serializers.Serializer):
    """Serializer for adding comments to blog posts"""
    author_name = serializers.CharField(max_length=100)
    author_email = serializers.EmailField()
    content = serializers.CharField(max_length=1000)

    def create(self, validated_data):
        post_slug = self.context['post_slug']
        post = BlogPost.objects.get(slug=post_slug, is_published=True)
        return BlogComment.objects.create(post=post, **validated_data)