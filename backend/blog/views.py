from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import BlogPost, BlogCategory, BlogComment
from .serializers import (
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogPostCreateUpdateSerializer,
    BlogCategorySerializer,
    BlogCommentSerializer,
    AddCommentSerializer
)
from .filters import BlogPostFilter


# Public Blog Views (for frontend users)
class BlogPostListView(generics.ListAPIView):
    """List all published blog posts"""
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BlogPostFilter
    search_fields = ['title', 'excerpt', 'content', 'tags']
    ordering_fields = ['created_at', 'published_at', 'views_count', 'title']
    ordering = ['-published_at', '-created_at']

    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True).select_related('author', 'category')


class BlogPostDetailView(generics.RetrieveAPIView):
    """Get a single published blog post by slug"""
    serializer_class = BlogPostDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True).select_related('author', 'category')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class FeaturedBlogPostsView(generics.ListAPIView):
    """List featured blog posts"""
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return BlogPost.objects.filter(
            is_published=True, 
            is_featured=True
        ).select_related('author', 'category')[:6]


class LatestBlogPostsView(generics.ListAPIView):
    """List latest blog posts"""
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return BlogPost.objects.filter(
            is_published=True
        ).select_related('author', 'category').order_by('-published_at', '-created_at')[:10]


class BlogCategoryListView(generics.ListAPIView):
    """List all active blog categories"""
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return BlogCategory.objects.filter(is_active=True)


class BlogCategoryDetailView(generics.RetrieveAPIView):
    """Get a single blog category by slug"""
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return BlogCategory.objects.filter(is_active=True)


class BlogPostCommentsView(generics.ListAPIView):
    """List approved comments for a blog post"""
    serializer_class = BlogCommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        post_slug = self.kwargs['slug']
        return BlogComment.objects.filter(
            post__slug=post_slug,
            post__is_published=True,
            is_approved=True
        ).order_by('-created_at')


@api_view(['POST'])
@permission_classes([AllowAny])
def add_blog_comment(request, slug):
    """Add a comment to a blog post"""
    try:
        post = BlogPost.objects.get(slug=slug, is_published=True)
    except BlogPost.DoesNotExist:
        return Response(
            {'error': 'Blog post not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = AddCommentSerializer(
        data=request.data,
        context={'post_slug': slug}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'message': 'Comment submitted successfully. It will be reviewed before publishing.'},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Admin Blog Views (for admin panel)
class AdminBlogPostListView(generics.ListAPIView):
    """List all blog posts for admin (including unpublished)"""
    serializer_class = BlogPostListSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BlogPostFilter
    search_fields = ['title', 'excerpt', 'content', 'tags']
    ordering_fields = ['created_at', 'published_at', 'views_count', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        return BlogPost.objects.all().select_related('author', 'category')


class AdminBlogPostDetailView(generics.RetrieveAPIView):
    """Get a single blog post for admin (including unpublished)"""
    serializer_class = BlogPostDetailSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'

    def get_queryset(self):
        return BlogPost.objects.all().select_related('author', 'category')


class AdminBlogPostCreateView(generics.CreateAPIView):
    """Create a new blog post"""
    serializer_class = BlogPostCreateUpdateSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class AdminBlogPostUpdateView(generics.UpdateAPIView):
    """Update a blog post"""
    serializer_class = BlogPostCreateUpdateSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'

    def get_queryset(self):
        return BlogPost.objects.all()


class AdminBlogPostDeleteView(generics.DestroyAPIView):
    """Delete a blog post"""
    permission_classes = [IsAdminUser]
    lookup_field = 'id'

    def get_queryset(self):
        return BlogPost.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Blog post deleted successfully'},
            status=status.HTTP_200_OK
        )


class AdminBlogCategoryListView(generics.ListCreateAPIView):
    """List and create blog categories"""
    serializer_class = BlogCategorySerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return BlogCategory.objects.all()


class AdminBlogCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a blog category"""
    serializer_class = BlogCategorySerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'

    def get_queryset(self):
        return BlogCategory.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.blog_posts.exists():
            return Response(
                {'error': 'Cannot delete category with existing posts'},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(
            {'message': 'Category deleted successfully'},
            status=status.HTTP_200_OK
        )