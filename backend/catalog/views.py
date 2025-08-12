# catalog/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from .models import HeroSlide
from .serializers import HeroSlideSerializer, AdminHeroSlideSerializer

class HeroSlideViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public: GET /api/hero-slides/
    """
    queryset = HeroSlide.objects.filter(is_active=True)
    serializer_class = HeroSlideSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering = ["sort_order", "-created_at"]


class AdminHeroSlideViewSet(viewsets.ModelViewSet):
    """
    Admin: CRUD /api/admin/hero-slides/
    """
    queryset = HeroSlide.objects.all()
    serializer_class = AdminHeroSlideSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "subtitle", "button_text", "button_link"]
    ordering_fields = ["sort_order", "created_at", "title"]
    ordering = ["sort_order", "-created_at"]
