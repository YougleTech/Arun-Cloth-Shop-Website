# catalog/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

public_router = DefaultRouter()
public_router.register("hero-slides", views.HeroSlideViewSet, basename="hero-slides")

admin_router = DefaultRouter()
admin_router.register("hero-slides", views.AdminHeroSlideViewSet, basename="admin-hero-slides")

urlpatterns = [
    path("", include(public_router.urls)),           # /api/hero-slides/
    path("admin/", include(admin_router.urls)),      # /api/admin/hero-slides/
]
