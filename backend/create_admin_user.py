#!/usr/bin/env python
"""
Create an admin user for testing blog functionality
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arunbackend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin_user():
    print("Creating admin user for blog testing...")
    
    # Check if admin user already exists
    if User.objects.filter(username='admin').exists():
        admin_user = User.objects.get(username='admin')
        print(f"Admin user already exists: {admin_user.username}")
        print(f"Email: {admin_user.email}")
        print(f"Is staff: {admin_user.is_staff}")
        print(f"Is superuser: {admin_user.is_superuser}")
        return admin_user
    
    # Create new admin user
    admin_user = User.objects.create_user(
        username='admin',
        email='admin@arunclothshop.com',
        password='admin123',
        full_name='Admin User',
        is_staff=True,
        is_superuser=True,
        is_active=True
    )
    
    print(f"✅ Created admin user: {admin_user.username}")
    print(f"📧 Email: {admin_user.email}")
    print(f"🔑 Password: admin123")
    print(f"👤 Full name: {admin_user.full_name}")
    print(f"🛡️ Is staff: {admin_user.is_staff}")
    print(f"🔐 Is superuser: {admin_user.is_superuser}")
    
    return admin_user

if __name__ == '__main__':
    create_admin_user()
    print("\n" + "="*50)
    print("🎯 Next steps:")
    print("1. Go to http://localhost:3000/login")
    print("2. Login with:")
    print("   Username: admin")
    print("   Password: admin123")
    print("3. Go to http://localhost:3000/admin/blog")
    print("4. You should now be able to manage blog posts!")
    print("="*50)