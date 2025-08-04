from rest_framework import generics, viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Min, Max
from django.db import models
from .models import Category, Product, ProductImage, ProductReview
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateUpdateSerializer, ProductImageSerializer, 
    ProductReviewSerializer, ProductReviewCreateSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for categories - read only for frontend
    """
    queryset = Category.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'

    @action(detail=True, methods=['get'])
    def products(self, request, id=None):
        """Get products in this category"""
        category = self.get_object()
        products = Product.objects.filter(
            category=category, 
            is_available=True
        ).select_related('category').prefetch_related('images')
        
        # Apply filtering
        material = request.query_params.get('material')
        gsm_min = request.query_params.get('gsm_min')
        gsm_max = request.query_params.get('gsm_max')
        price_min = request.query_params.get('price_min')
        price_max = request.query_params.get('price_max')
        usage = request.query_params.get('usage')
        color = request.query_params.get('color')
        
        if material:
            products = products.filter(material=material)
        if gsm_min:
            products = products.filter(gsm__gte=gsm_min)
        if gsm_max:
            products = products.filter(gsm__lte=gsm_max)
        if price_min:
            products = products.filter(price_per_meter__gte=price_min)
        if price_max:
            products = products.filter(price_per_meter__lte=price_max)
        if usage:
            products = products.filter(usage=usage)
        if color:
            products = products.filter(colors_available__icontains=color)
        
        # Sorting
        sort_by = request.query_params.get('sort_by', 'name')
        if sort_by == 'price_low':
            products = products.order_by('price_per_meter')
        elif sort_by == 'price_high':
            products = products.order_by('-price_per_meter')
        elif sort_by == 'newest':
            products = products.order_by('-created_at')
        elif sort_by == 'popular':
            products = products.order_by('-is_featured', 'name')
        else:
            products = products.order_by('name')
        
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for products - read only for frontend
    """
    queryset = Product.objects.filter(is_available=True).select_related('category').prefetch_related('images', 'reviews')
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'material', 'usage', 'tags', 'is_featured']
    search_fields = ['name', 'description', 'material', 'colors_available']
    ordering_fields = ['name', 'price_per_meter', 'created_at', 'gsm']
    ordering = ['name']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by price range
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        if price_min:
            queryset = queryset.filter(price_per_meter__gte=price_min)
        if price_max:
            queryset = queryset.filter(price_per_meter__lte=price_max)
        
        # Filter by GSM range
        gsm_min = self.request.query_params.get('gsm_min')
        gsm_max = self.request.query_params.get('gsm_max')
        if gsm_min:
            queryset = queryset.filter(gsm__gte=gsm_min)
        if gsm_max:
            queryset = queryset.filter(gsm__lte=gsm_max)
        
        # Filter by color
        color = self.request.query_params.get('color')
        if color:
            queryset = queryset.filter(colors_available__icontains=color)
        
        # Filter by stock availability
        in_stock_only = self.request.query_params.get('in_stock')
        if in_stock_only == 'true':
            queryset = queryset.filter(stock_quantity__gt=0)
        
        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products"""
        featured_products = self.get_queryset().filter(is_featured=True)[:8]
        serializer = ProductListSerializer(featured_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest products"""
        latest_products = self.get_queryset().order_by('-created_at')[:8]
        serializer = ProductListSerializer(latest_products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        """Get reviews for a product"""
        product = self.get_object()
        reviews = product.reviews.filter(is_approved=True).order_by('-created_at')
        serializer = ProductReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def add_review(self, request, slug=None):
        """Add a review for a product"""
        product = self.get_object()
        serializer = ProductReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(
                {'message': 'Review submitted successfully. It will be published after approval.'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def filter_options(self, request):
        """Get all available filter options"""
        materials = Product.objects.filter(is_available=True).values_list('material', flat=True).distinct()
        usages = Product.objects.filter(is_available=True).values_list('usage', flat=True).distinct()
        tags = Product.objects.filter(is_available=True, tags__isnull=False).exclude(tags='').values_list('tags', flat=True).distinct()
        
        # Get price range
        price_range = Product.objects.filter(is_available=True).aggregate(
            min_price=Min('price_per_meter'),
            max_price=Max('price_per_meter')
        )
        
        # Get GSM range
        gsm_range = Product.objects.filter(is_available=True).aggregate(
            min_gsm=Min('gsm'),
            max_gsm=Max('gsm')
        )
        
        return Response({
            'materials': list(materials),
            'usages': list(usages),
            'tags': list(tags),
            'price_range': price_range,
            'gsm_range': gsm_range
        })


# Admin API Views (for future admin panel development)
class AdminCategoryViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for categories - full CRUD operations
    """
    queryset = Category.objects.all().order_by('sort_order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class AdminProductViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for products - full CRUD operations
    """
    queryset = Product.objects.all().select_related('category').prefetch_related('images')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'material', 'usage', 'is_available', 'is_featured', 'tags']
    search_fields = ['name', 'description', 'slug']
    ordering_fields = ['name', 'price_per_meter', 'created_at', 'stock_quantity']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_search(request):
    """
    Global product search endpoint
    """
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'results': []})
    
    products = Product.objects.filter(
        Q(name__icontains=query) | 
        Q(description__icontains=query) |
        Q(material__icontains=query) |
        Q(colors_available__icontains=query),
        is_available=True
    ).select_related('category').prefetch_related('images')[:20]
    
    serializer = ProductListSerializer(products, many=True)
    return Response({'results': serializer.data})


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    """
    Get dashboard statistics
    """
    stats = {
        'total_products': Product.objects.filter(is_available=True).count(),
        'total_categories': Category.objects.filter(is_active=True).count(),
        'featured_products': Product.objects.filter(is_featured=True, is_available=True).count(),
        'out_of_stock': Product.objects.filter(stock_quantity=0, is_available=True).count(),
    }
    return Response(stats)