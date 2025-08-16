from django.contrib import admin
from django.utils.html import format_html
from .models import BlogPost, BlogCategory, BlogComment


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'posts_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['posts_count', 'created_at', 'updated_at']

    def posts_count(self, obj):
        return obj.posts_count
    posts_count.short_description = 'Published Posts'


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author', 'category', 'is_published', 
        'is_featured', 'views_count', 'published_at'
    ]
    list_filter = [
        'is_published', 'is_featured', 'category', 
        'created_at', 'published_at', 'author'
    ]
    search_fields = ['title', 'excerpt', 'content', 'tags']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views_count', 'created_at', 'updated_at', 'published_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'excerpt', 'content', 'featured_image')
        }),
        ('Classification', {
            'fields': ('author', 'category', 'tags')
        }),
        ('Status', {
            'fields': ('is_published', 'is_featured')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Analytics', {
            'fields': ('views_count', 'created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author', 'category')

    def save_model(self, request, obj, form, change):
        if not change:  # If creating new post
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['author_name', 'post', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['author_name', 'author_email', 'content', 'post__title']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Comment Information', {
            'fields': ('post', 'author_name', 'author_email', 'content')
        }),
        ('Moderation', {
            'fields': ('is_approved', 'created_at')
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('post')

    actions = ['approve_comments', 'disapprove_comments']

    def approve_comments(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} comments were approved.')
    approve_comments.short_description = 'Approve selected comments'

    def disapprove_comments(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} comments were disapproved.')
    disapprove_comments.short_description = 'Disapprove selected comments'