#!/usr/bin/env python
"""
Simple test to verify blog models and data
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arunbackend.settings')
django.setup()

from blog.models import BlogPost, BlogCategory, BlogComment

def test_blog_data():
    print("🧪 Testing Blog Data")
    print("=" * 40)
    
    # Test categories
    categories = BlogCategory.objects.all()
    print(f"📁 Categories: {categories.count()}")
    for cat in categories:
        print(f"  - {cat.name} (slug: {cat.slug}, posts: {cat.posts_count})")
    
    print()
    
    # Test posts
    posts = BlogPost.objects.all()
    published_posts = BlogPost.objects.filter(is_published=True)
    featured_posts = BlogPost.objects.filter(is_featured=True, is_published=True)
    
    print(f"📝 Total Posts: {posts.count()}")
    print(f"📝 Published Posts: {published_posts.count()}")
    print(f"⭐ Featured Posts: {featured_posts.count()}")
    
    print("\nPublished Posts:")
    for post in published_posts:
        print(f"  - {post.title}")
        print(f"    Slug: {post.slug}")
        print(f"    Author: {post.author_name}")
        print(f"    Category: {post.category.name if post.category else 'None'}")
        print(f"    Tags: {post.tags}")
        print(f"    Views: {post.views_count}")
        print(f"    Featured: {'Yes' if post.is_featured else 'No'}")
        print()
    
    print("=" * 40)
    print("✅ Blog data test complete!")
    
    # Test API URLs
    print("\n🌐 Available API Endpoints:")
    print("GET /api/blog/posts/ - List all published posts")
    print("GET /api/blog/posts/featured/ - List featured posts")
    print("GET /api/blog/posts/latest/ - List latest posts")
    print("GET /api/blog/posts/<slug>/ - Get specific post")
    print("GET /api/blog/categories/ - List categories")
    print("\nAdmin Endpoints (require authentication):")
    print("GET /api/blog/admin/posts/ - List all posts (admin)")
    print("POST /api/blog/admin/posts/create/ - Create new post")
    print("PUT /api/blog/admin/posts/<id>/update/ - Update post")
    print("DELETE /api/blog/admin/posts/<id>/delete/ - Delete post")

if __name__ == '__main__':
    test_blog_data()