from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register('orders', views.OrderViewSet, basename='orders')
router.register('quotes', views.QuoteRequestViewSet, basename='quotes')

urlpatterns = [
    path('', include(router.urls)),
]