from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductReview


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'sort_order']


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'is_active', 'products_count']
    
    def get_products_count(self, obj):
        return obj.products.filter(is_available=True).count()


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image = serializers.CharField(read_only=True)
    available_colors_list = serializers.ListField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    price_per_meter = serializers.SerializerMethodField()
    wholesale_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'category_name', 
            'main_image', 'material', 'gsm', 'primary_color', 'available_colors_list',
            'price_per_meter', 'wholesale_price', 'minimum_order_quantity', 
            'is_available', 'is_featured', 'is_in_stock', 'tags', 'stock_quantity'
        ]

    def get_price_per_meter(self, obj):
        request = self.context.get('request')
        return obj.price_per_meter if request and request.user.is_staff else None

    def get_wholesale_price(self, obj):
        request = self.context.get('request')
        return obj.wholesale_price if request and request.user.is_staff else None

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    available_colors_list = serializers.ListField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    price_per_meter = serializers.SerializerMethodField()
    wholesale_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 'category',
            'material', 'gsm', 'width', 'colors_available', 'available_colors_list',
            'primary_color', 'usage', 'care_instructions', 'price_per_meter',
            'wholesale_price', 'minimum_order_quantity', 'stock_quantity',
            'is_available', 'is_featured', 'is_in_stock', 'tags', 'images',
            'meta_title', 'meta_description', 'reviews_count', 'average_rating',
            'created_at', 'updated_at', 'main_image'
        ]

    def get_price_per_meter(self, obj):
        request = self.context.get('request')
        return obj.price_per_meter if request and request.user.is_staff else None

    def get_wholesale_price(self, obj):
        request = self.context.get('request')
        return obj.wholesale_price if request and request.user.is_staff else None

    def get_reviews_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()
    
    def get_average_rating(self, obj):
        approved_reviews = obj.reviews.filter(is_approved=True)
        if approved_reviews.exists():
            total_rating = sum(review.rating for review in approved_reviews)
            return round(total_rating / approved_reviews.count(), 1)
        return 0

    main_image = serializers.SerializerMethodField()

    def get_main_image(self, obj):
        request = self.context.get('request')
        if obj.main_image and request:
            return request.build_absolute_uri(obj.main_image)
        return None
    
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products"""
    
    class Meta:
        model = Product
        fields = [
            'name', 'slug', 'description', 'short_description', 'category',
            'material', 'gsm', 'width', 'colors_available', 'primary_color',
            'usage', 'care_instructions', 'price_per_meter', 'wholesale_price',
            'minimum_order_quantity', 'stock_quantity', 'is_available',
            'is_featured', 'tags', 'meta_title', 'meta_description', 'main_image'
        ]
    
    def validate_slug(self, value):
        # Check if slug is unique (excluding current instance for updates)
        instance = getattr(self, 'instance', None)
        if instance:
            if Product.objects.filter(slug=value).exclude(id=instance.id).exists():
                raise serializers.ValidationError("Product with this slug already exists.")
        else:
            if Product.objects.filter(slug=value).exists():
                raise serializers.ValidationError("Product with this slug already exists.")
        return value
    
    def validate(self, data):
        # Validate that wholesale price is not higher than retail price
        if data.get('wholesale_price') and data.get('price_per_meter'):
            if data['wholesale_price'] > data['price_per_meter']:
                raise serializers.ValidationError("Wholesale price cannot be higher than retail price.")
        return data


class ProductReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = ['id', 'customer_name', 'rating', 'review_text', 'created_at']


class ProductReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = ['product', 'customer_name', 'customer_email', 'rating', 'review_text']
        
