import django_filters
from .models import BlogPost, BlogCategory


class BlogPostFilter(django_filters.FilterSet):
    """Filter for blog posts"""
    
    # Category filtering
    category = django_filters.ModelChoiceFilter(
        queryset=BlogCategory.objects.filter(is_active=True),
        field_name='category'
    )
    
    # Tag filtering
    tag = django_filters.CharFilter(
        field_name='tags',
        lookup_expr='icontains',
        help_text='Filter by tag name'
    )
    
    # Publication status
    is_published = django_filters.BooleanFilter(
        field_name='is_published'
    )
    
    # Featured posts
    is_featured = django_filters.BooleanFilter(
        field_name='is_featured'
    )
    
    # Date range filtering
    published_after = django_filters.DateTimeFilter(
        field_name='published_at',
        lookup_expr='gte'
    )
    
    published_before = django_filters.DateTimeFilter(
        field_name='published_at',
        lookup_expr='lte'
    )
    
    # Author filtering
    author = django_filters.CharFilter(
        field_name='author__username',
        lookup_expr='icontains'
    )

    class Meta:
        model = BlogPost
        fields = [
            'category', 'tag', 'is_published', 'is_featured',
            'published_after', 'published_before', 'author'
        ]