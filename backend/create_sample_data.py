#!/usr/bin/env python
"""
Script to create sample data for testing the product catalog API
"""
import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.append('/app/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arunbackend.settings')

# Setup Django
django.setup()

from products.models import Category, Product

def create_sample_data():
    print("Creating sample categories...")
    
    # Create categories
    categories_data = [
        {
            'name': 'Cotton Fabrics',
            'description': 'High-quality cotton fabrics suitable for various clothing types',
        },
        {
            'name': 'Silk Fabrics',
            'description': 'Premium silk fabrics for elegant wear and special occasions',
        },
        {
            'name': 'Wool Fabrics',
            'description': 'Warm and durable wool fabrics for winter wear',
        },
        {
            'name': 'Polyester Fabrics',
            'description': 'Versatile polyester fabrics for everyday use',
        },
        {
            'name': 'Ethnic Wear',
            'description': 'Traditional fabrics for ethnic and cultural wear',
        }
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        categories.append(category)
        print(f"{'Created' if created else 'Found'} category: {category.name}")
    
    print("\nCreating sample products...")
    
    # Sample products data
    products_data = [
        {
            'name': 'Premium Cotton Shirting',
            'slug': 'premium-cotton-shirting',
            'description': 'High-quality cotton fabric perfect for formal and casual shirts. Breathable and comfortable with excellent durability.',
            'short_description': 'Premium cotton fabric for shirts',
            'category': categories[0],  # Cotton Fabrics
            'material': 'cotton',
            'gsm': 120,
            'width': '58 inches',
            'colors_available': 'White, Blue, Pink, Yellow, Green',
            'primary_color': 'White',
            'usage': 'shirt',
            'care_instructions': 'Machine wash cold, tumble dry low, iron on medium heat',
            'price_per_meter': 85.00,
            'wholesale_price': 72.00,
            'minimum_order_quantity': 10,
            'stock_quantity': 500,
            'is_available': True,
            'is_featured': True,
            'tags': 'premium',
        },
        {
            'name': 'Elegant Silk Saree Material',
            'slug': 'elegant-silk-saree-material',
            'description': 'Beautiful silk fabric traditionally used for sarees. Features intricate patterns and rich texture.',
            'short_description': 'Traditional silk fabric for sarees',
            'category': categories[1],  # Silk Fabrics
            'material': 'silk',
            'gsm': 150,
            'width': '44 inches',
            'colors_available': 'Red, Gold, Maroon, Royal Blue, Emerald Green',
            'primary_color': 'Red',
            'usage': 'saree',
            'care_instructions': 'Dry clean only, store in cool dry place',
            'price_per_meter': 450.00,
            'wholesale_price': 380.00,
            'minimum_order_quantity': 5,
            'stock_quantity': 150,
            'is_available': True,
            'is_featured': True,
            'tags': 'hot',
        },
        {
            'name': 'Winter Wool Suiting',
            'slug': 'winter-wool-suiting',
            'description': 'Warm and comfortable wool fabric ideal for winter suits and formal wear.',
            'short_description': 'Premium wool fabric for winter suits',
            'category': categories[2],  # Wool Fabrics
            'material': 'wool',
            'gsm': 280,
            'width': '60 inches',
            'colors_available': 'Black, Navy Blue, Charcoal Grey, Brown',
            'primary_color': 'Black',
            'usage': 'suit',
            'care_instructions': 'Dry clean recommended, can be pressed with steam',
            'price_per_meter': 320.00,
            'wholesale_price': 280.00,
            'minimum_order_quantity': 8,
            'stock_quantity': 200,
            'is_available': True,
            'is_featured': False,
            'tags': 'new',
        },
        {
            'name': 'Versatile Polyester Blend',
            'slug': 'versatile-polyester-blend',
            'description': 'Easy-care polyester blend fabric suitable for casual wear and everyday clothing.',
            'short_description': 'Easy-care polyester blend for casual wear',
            'category': categories[3],  # Polyester Fabrics
            'material': 'polyester',
            'gsm': 180,
            'width': '58 inches',
            'colors_available': 'White, Black, Grey, Beige, Light Blue',
            'primary_color': 'White',
            'usage': 'casual_wear',
            'care_instructions': 'Machine washable, quick dry, minimal ironing required',
            'price_per_meter': 65.00,
            'wholesale_price': 55.00,
            'minimum_order_quantity': 15,
            'stock_quantity': 800,
            'is_available': True,
            'is_featured': False,
            'tags': 'bestseller',
        },
        {
            'name': 'Traditional Khadi Cotton',
            'slug': 'traditional-khadi-cotton',
            'description': 'Handwoven khadi cotton fabric representing traditional Indian craftsmanship.',
            'short_description': 'Handwoven khadi cotton fabric',
            'category': categories[4],  # Ethnic Wear
            'material': 'khadi',
            'gsm': 140,
            'width': '45 inches',
            'colors_available': 'Natural White, Cream, Light Brown, Khaki',
            'primary_color': 'Natural White',
            'usage': 'ethnic_wear',
            'care_instructions': 'Hand wash recommended, air dry, iron on low heat',
            'price_per_meter': 120.00,
            'wholesale_price': 100.00,
            'minimum_order_quantity': 12,
            'stock_quantity': 300,
            'is_available': True,
            'is_featured': True,
            'tags': 'premium',
        },
        {
            'name': 'Lightweight Chiffon',
            'slug': 'lightweight-chiffon',
            'description': 'Delicate and lightweight chiffon fabric perfect for flowing dresses and scarves.',
            'short_description': 'Delicate chiffon for dresses and scarves',
            'category': categories[1],  # Silk Fabrics
            'material': 'chiffon',
            'gsm': 80,
            'width': '44 inches',
            'colors_available': 'Pastels: Pink, Lavender, Peach, Mint, Sky Blue',
            'primary_color': 'Pink',
            'usage': 'dress',
            'care_instructions': 'Hand wash gently, air dry, iron on lowest heat with cloth',
            'price_per_meter': 180.00,
            'wholesale_price': 150.00,
            'minimum_order_quantity': 8,
            'stock_quantity': 250,
            'is_available': True,
            'is_featured': False,
            'tags': 'new',
        }
    ]
    
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            slug=product_data['slug'],
            defaults=product_data
        )
        print(f"{'Created' if created else 'Found'} product: {product.name}")
    
    print(f"\n✅ Sample data creation complete!")
    print(f"📊 Categories: {Category.objects.count()}")
    print(f"📦 Products: {Product.objects.count()}")

if __name__ == '__main__':
    create_sample_data()