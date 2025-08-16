#!/usr/bin/env python
"""
Create sample blog data for testing
"""
import os
import sys
import django
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arunbackend.settings')
django.setup()

from django.contrib.auth import get_user_model
from blog.models import BlogCategory, BlogPost

User = get_user_model()

def create_sample_blog_data():
    print("Creating sample blog data...")
    
    # Get or create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@arunclothshop.com',
            'is_staff': True,
            'is_superuser': True,
            'full_name': 'Admin User'
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Created admin user: {admin_user.username}")
    else:
        print(f"Using existing admin user: {admin_user.username}")
    
    # Create blog categories
    categories_data = [
        {
            'name': 'Fashion Trends',
            'description': 'Latest fashion trends and style tips'
        },
        {
            'name': 'Fabric Care',
            'description': 'How to care for different types of fabrics'
        },
        {
            'name': 'Traditional Wear',
            'description': 'Traditional Nepali clothing and cultural wear'
        },
        {
            'name': 'Business Updates',
            'description': 'News and updates from Arun Cloth Shop'
        }
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = BlogCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        categories.append(category)
        if created:
            print(f"Created category: {category.name}")
    
    # Create sample blog posts
    posts_data = [
        {
            'title': 'Latest Fashion Trends for 2024',
            'excerpt': 'Discover the hottest fashion trends that are dominating 2024. From vibrant colors to sustainable fabrics.',
            'content': '''
            <h2>Fashion Forward: 2024 Trends</h2>
            <p>The fashion world is constantly evolving, and 2024 brings exciting new trends that blend comfort with style. Here are the top trends we're seeing:</p>
            
            <h3>1. Sustainable Fabrics</h3>
            <p>Eco-friendly materials are no longer just a trend—they're becoming the standard. Organic cotton, bamboo fiber, and recycled polyester are leading the way.</p>
            
            <h3>2. Bold Colors</h3>
            <p>This year is all about making a statement with vibrant colors. Think electric blues, sunset oranges, and emerald greens.</p>
            
            <h3>3. Comfort Meets Style</h3>
            <p>The pandemic changed how we dress, and comfortable yet stylish clothing continues to dominate. Athleisure and relaxed fits are here to stay.</p>
            
            <p>At Arun Cloth Shop, we're committed to bringing you the latest trends while maintaining our focus on quality and affordability.</p>
            ''',
            'category': categories[0],
            'tags': 'fashion, trends, 2024, style, clothing',
            'is_published': True,
            'is_featured': True
        },
        {
            'title': 'How to Care for Your Cotton Fabrics',
            'excerpt': 'Learn the best practices for maintaining your cotton clothing to ensure they last longer and stay looking fresh.',
            'content': '''
            <h2>Cotton Care 101</h2>
            <p>Cotton is one of the most popular and versatile fabrics, but proper care is essential to maintain its quality and longevity.</p>
            
            <h3>Washing Tips</h3>
            <ul>
                <li>Use cold water to prevent shrinking</li>
                <li>Turn garments inside out to protect colors</li>
                <li>Use mild detergent to preserve fabric integrity</li>
                <li>Avoid overloading the washing machine</li>
            </ul>
            
            <h3>Drying Guidelines</h3>
            <ul>
                <li>Air dry when possible to prevent shrinkage</li>
                <li>If using a dryer, use low heat settings</li>
                <li>Remove while slightly damp to prevent over-drying</li>
            </ul>
            
            <h3>Storage Tips</h3>
            <p>Store cotton garments in a cool, dry place. Use cedar blocks or lavender sachets to keep them fresh and pest-free.</p>
            ''',
            'category': categories[1],
            'tags': 'cotton, fabric care, washing, maintenance',
            'is_published': True,
            'is_featured': False
        },
        {
            'title': 'The Beauty of Traditional Nepali Clothing',
            'excerpt': 'Explore the rich heritage of traditional Nepali attire and how modern fashion incorporates these timeless designs.',
            'content': '''
            <h2>Traditional Nepali Fashion Heritage</h2>
            <p>Nepal's traditional clothing reflects the country's rich cultural diversity and centuries-old craftsmanship traditions.</p>
            
            <h3>Daura Suruwal</h3>
            <p>The national dress for men, consisting of a closed-neck shirt (daura) and fitted trousers (suruwal), represents dignity and cultural pride.</p>
            
            <h3>Gunyu Cholo</h3>
            <p>The traditional dress for women, featuring a long skirt (gunyu) and fitted blouse (cholo), showcases elegant Nepali femininity.</p>
            
            <h3>Modern Adaptations</h3>
            <p>Today's designers are beautifully blending traditional elements with contemporary styles, creating pieces that honor heritage while meeting modern needs.</p>
            
            <p>At Arun Cloth Shop, we proudly offer both traditional and modern interpretations of these classic designs.</p>
            ''',
            'category': categories[2],
            'tags': 'traditional, nepali, clothing, culture, heritage',
            'is_published': True,
            'is_featured': True
        },
        {
            'title': 'New Collection Launch: Spring 2024',
            'excerpt': 'We are excited to announce our new Spring 2024 collection featuring fresh designs and premium fabrics.',
            'content': '''
            <h2>Spring 2024 Collection Now Available!</h2>
            <p>We're thrilled to introduce our latest Spring 2024 collection, featuring over 200 new designs that capture the essence of the season.</p>
            
            <h3>What's New</h3>
            <ul>
                <li>Lightweight cotton blends perfect for spring weather</li>
                <li>Floral patterns inspired by Nepal's beautiful landscapes</li>
                <li>Sustainable fabric options for eco-conscious customers</li>
                <li>Extended size range to serve all our customers</li>
            </ul>
            
            <h3>Special Launch Offers</h3>
            <p>To celebrate our new collection, we're offering:</p>
            <ul>
                <li>15% off on all new arrivals</li>
                <li>Free alterations for the first 100 customers</li>
                <li>Bulk order discounts for wholesale buyers</li>
            </ul>
            
            <p>Visit our store or browse our online catalog to explore the full collection!</p>
            ''',
            'category': categories[3],
            'tags': 'new collection, spring 2024, launch, offers',
            'is_published': True,
            'is_featured': False
        },
        {
            'title': 'Choosing the Right Fabric for Different Occasions',
            'excerpt': 'A comprehensive guide to selecting the perfect fabric based on the occasion, weather, and personal style preferences.',
            'content': '''
            <h2>Fabric Selection Guide</h2>
            <p>Choosing the right fabric can make or break your outfit. Here's our expert guide to help you make the best choices.</p>
            
            <h3>Formal Occasions</h3>
            <p>For formal events, opt for:</p>
            <ul>
                <li>Silk for elegance and luxury</li>
                <li>Fine cotton for comfort and breathability</li>
                <li>Wool blends for structure and durability</li>
            </ul>
            
            <h3>Casual Wear</h3>
            <p>For everyday comfort:</p>
            <ul>
                <li>Cotton for versatility and easy care</li>
                <li>Linen for hot weather and relaxed style</li>
                <li>Cotton blends for durability and comfort</li>
            </ul>
            
            <h3>Seasonal Considerations</h3>
            <p>Summer: Choose lightweight, breathable fabrics like cotton and linen.</p>
            <p>Winter: Opt for warmer materials like wool and thick cotton blends.</p>
            <p>Monsoon: Select quick-dry fabrics and avoid delicate materials.</p>
            ''',
            'category': categories[1],
            'tags': 'fabric selection, occasions, guide, tips',
            'is_published': True,
            'is_featured': False
        }
    ]
    
    for post_data in posts_data:
        post, created = BlogPost.objects.get_or_create(
            title=post_data['title'],
            defaults={
                'excerpt': post_data['excerpt'],
                'content': post_data['content'],
                'author': admin_user,
                'category': post_data['category'],
                'tags': post_data['tags'],
                'is_published': post_data['is_published'],
                'is_featured': post_data['is_featured'],
                'published_at': timezone.now() if post_data['is_published'] else None,
                'views_count': 0
            }
        )
        if created:
            print(f"Created blog post: {post.title}")
    
    print("\nSample blog data created successfully!")
    print(f"Created {BlogCategory.objects.count()} categories")
    print(f"Created {BlogPost.objects.count()} blog posts")
    print(f"Published posts: {BlogPost.objects.filter(is_published=True).count()}")
    print(f"Featured posts: {BlogPost.objects.filter(is_featured=True).count()}")

if __name__ == '__main__':
    create_sample_blog_data()