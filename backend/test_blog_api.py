#!/usr/bin/env python
"""
Test script for blog API endpoints
"""
import requests
import json

BASE_URL = 'http://localhost:8000/api/blog'

def test_endpoint(endpoint, description):
    """Test a single endpoint"""
    print(f"\n{'='*50}")
    print(f"Testing: {description}")
    print(f"URL: {BASE_URL}{endpoint}")
    print('='*50)
    
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Type: {type(data)}")
            
            if isinstance(data, dict):
                if 'results' in data:
                    print(f"Results Count: {len(data['results'])}")
                    if data['results']:
                        print("First Result Keys:", list(data['results'][0].keys()))
                else:
                    print("Response Keys:", list(data.keys()))
            elif isinstance(data, list):
                print(f"List Length: {len(data)}")
                if data:
                    print("First Item Keys:", list(data[0].keys()))
            
            # Print first few characters of response for preview
            response_text = json.dumps(data, indent=2)[:500]
            print(f"Response Preview:\n{response_text}...")
        else:
            print(f"Error Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Test all blog endpoints"""
    print("🧪 Testing Blog API Endpoints")
    print("Make sure Django server is running: python manage.py runserver")
    
    # Test endpoints
    endpoints = [
        ('/posts/', 'List all published blog posts'),
        ('/posts/featured/', 'List featured blog posts'),
        ('/posts/latest/', 'List latest blog posts'),
        ('/categories/', 'List all blog categories'),
    ]
    
    for endpoint, description in endpoints:
        test_endpoint(endpoint, description)
    
    print(f"\n{'='*50}")
    print("✅ Blog API Testing Complete!")
    print("If you see data above, the blog API is working correctly.")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()