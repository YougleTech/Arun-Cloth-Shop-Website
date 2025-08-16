from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    # Public Blog URLs
    path('posts/', views.BlogPostListView.as_view(), name='post-list'),
    path('posts/featured/', views.FeaturedBlogPostsView.as_view(), name='featured-posts'),
    path('posts/latest/', views.LatestBlogPostsView.as_view(), name='latest-posts'),
    path('posts/<slug:slug>/', views.BlogPostDetailView.as_view(), name='post-detail'),
    
    # Categories
    path('categories/', views.BlogCategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', views.BlogCategoryDetailView.as_view(), name='category-detail'),
    
    # Comments
    path('posts/<slug:slug>/comments/', views.BlogPostCommentsView.as_view(), name='post-comments'),
    path('posts/<slug:slug>/add_comment/', views.add_blog_comment, name='add-comment'),
    
    # Admin Blog URLs
    path('admin/posts/', views.AdminBlogPostListView.as_view(), name='admin-post-list'),
    path('admin/posts/<uuid:id>/', views.AdminBlogPostDetailView.as_view(), name='admin-post-detail'),
    path('admin/posts/create/', views.AdminBlogPostCreateView.as_view(), name='admin-post-create'),
    path('admin/posts/<uuid:id>/update/', views.AdminBlogPostUpdateView.as_view(), name='admin-post-update'),
    path('admin/posts/<uuid:id>/delete/', views.AdminBlogPostDeleteView.as_view(), name='admin-post-delete'),
    
    # Admin Categories
    path('admin/categories/', views.AdminBlogCategoryListView.as_view(), name='admin-category-list'),
    path('admin/categories/<uuid:id>/', views.AdminBlogCategoryDetailView.as_view(), name='admin-category-detail'),
]