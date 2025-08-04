from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register('cart', views.CartViewSet, basename='cart')
router.register('saved-items', views.SavedItemViewSet, basename='saved-items')

urlpatterns = [
    path('', include(router.urls)),
]