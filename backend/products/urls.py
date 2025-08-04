from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('products', views.ProductViewSet, basename='product')

# Admin router for admin endpoints
admin_router = DefaultRouter()
admin_router.register('categories', views.AdminCategoryViewSet, basename='admin-category')
admin_router.register('products', views.AdminProductViewSet, basename='admin-product')

urlpatterns = [
    # Public API endpoints
    path('', include(router.urls)),
    
    # Admin API endpoints
    path('admin/', include(admin_router.urls)),
    
    # Additional endpoints
    path('search/', views.product_search, name='product-search'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
]