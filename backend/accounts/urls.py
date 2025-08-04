from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register('profile', views.UserProfileViewSet, basename='profile')
router.register('addresses', views.UserAddressViewSet, basename='addresses')

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Password management
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    
    # Email verification
    path('verify-email/', views.verify_email, name='verify_email'),
    
    # Utility
    path('check-availability/', views.check_availability, name='check_availability'),
    
    # Profile and addresses
    path('', include(router.urls)),
]