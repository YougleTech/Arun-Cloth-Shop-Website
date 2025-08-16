"""
URL configuration for arunbackend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework import permissions
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# drf-spectacular (OpenAPI / Swagger / ReDoc)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
    SpectacularYAMLAPIView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Authentication (JWT)
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # API Endpoints
    path('api/', include('products.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('cart.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('catalog.urls')),
    path('api/blog/', include('blog.urls')),

    # --- OpenAPI schema + docs (publicly accessible) ---
    path(
        'api/schema/',
        SpectacularAPIView.as_view(permission_classes=[permissions.AllowAny]),
        name='schema',
    ),
    path(
        'api/schema.yaml',
        SpectacularYAMLAPIView.as_view(permission_classes=[permissions.AllowAny]),
        name='schema-yaml',
    ),
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[permissions.AllowAny]),
        name='swagger-ui',
    ),
    path(
        'api/redoc/',
        SpectacularRedocView.as_view(url_name='schema', permission_classes=[permissions.AllowAny]),
        name='redoc',
    ),
]

# Serve media/static in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
