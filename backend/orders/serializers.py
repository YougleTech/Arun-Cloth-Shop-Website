from rest_framework import serializers
from django.utils import timezone
from accounts.serializers import UserAddressSerializer
from products.serializers import ProductListSerializer
from .models import Order, OrderItem, OrderStatusHistory, QuoteRequest


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    wholesale_total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'quantity', 'unit_price', 
            'wholesale_price', 'total_price', 'wholesale_total_price',
            'preferred_colors', 'special_instructions', 'created_at'
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """Simplified serializer for order lists"""
    total_items = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'payment_status', 
            'payment_status_display', 'payment_method', 'total_amount', 'total_items',
            'is_wholesale_order', 'created_at', 'estimated_delivery_date'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = UserAddressSerializer(read_only=True)
    billing_address = UserAddressSerializer(read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'payment_status', 
            'payment_status_display', 'payment_method', 'payment_method_display',
            'subtotal', 'discount_amount', 'tax_amount', 'shipping_cost', 'total_amount',
            'is_wholesale_order', 'wholesale_discount_percent', 'items', 'total_items',
            'shipping_address', 'billing_address', 'estimated_delivery_date',
            'actual_delivery_date', 'delivery_instructions', 'customer_notes',
            'tracking_number', 'courier_service', 'can_cancel',
            'created_at', 'updated_at', 'confirmed_at', 'shipped_at', 'delivered_at'
        ]


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating orders from cart"""
    shipping_address_id = serializers.UUIDField()
    billing_address_id = serializers.UUIDField(required=False)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES)
    delivery_instructions = serializers.CharField(required=False, allow_blank=True)
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    use_shipping_as_billing = serializers.BooleanField(default=True)
    
    def validate_shipping_address_id(self, value):
        from accounts.models import UserAddress
        request = self.context['request']
        
        try:
            address = UserAddress.objects.get(id=value, user=request.user, is_active=True)
            return value
        except UserAddress.DoesNotExist:
            raise serializers.ValidationError("मान्य ठेगाना फेला परेन।")
    
    def validate_billing_address_id(self, value):
        if not value:
            return value
            
        from accounts.models import UserAddress
        request = self.context['request']
        
        try:
            address = UserAddress.objects.get(id=value, user=request.user, is_active=True)
            return value
        except UserAddress.DoesNotExist:
            raise serializers.ValidationError("मान्य बिलिङ ठेगाना फेला परेन।")
    
    def validate(self, attrs):
        # If not using shipping as billing, billing address is required
        if not attrs.get('use_shipping_as_billing') and not attrs.get('billing_address_id'):
            raise serializers.ValidationError("बिलिङ ठेगाना आवश्यक छ।")
        
        return attrs


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OrderStatusHistory
        fields = [
            'id', 'status', 'status_display', 'notes', 'created_by_name', 'created_at'
        ]


class QuoteRequestSerializer(serializers.ModelSerializer):
    """Serializer for quote requests"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = QuoteRequest
        fields = [
            'id', 'quote_number', 'status', 'status_display', 'urgency', 'urgency_display',
            'fabric_type', 'material_preference', 'quantity_needed', 'preferred_colors',
            'usage_description', 'quality_requirements', 'delivery_location',
            'required_delivery_date', 'budget_range', 'quoted_price', 'quoted_total',
            'customer_message', 'admin_response', 'contact_via_whatsapp',
            'contact_via_email', 'contact_via_phone', 'is_expired',
            'created_at', 'updated_at', 'quoted_at', 'expires_at'
        ]
        read_only_fields = [
            'id', 'quote_number', 'quoted_price', 'quoted_total', 'admin_response',
            'quoted_at', 'expires_at', 'created_at', 'updated_at'
        ]


class CreateQuoteRequestSerializer(serializers.ModelSerializer):
    """Serializer for creating quote requests"""
    
    class Meta:
        model = QuoteRequest
        fields = [
            'fabric_type', 'material_preference', 'quantity_needed', 'preferred_colors',
            'usage_description', 'quality_requirements', 'delivery_location',
            'required_delivery_date', 'budget_range', 'customer_message', 'urgency',
            'contact_via_whatsapp', 'contact_via_email', 'contact_via_phone'
        ]
    
    def validate_quantity_needed(self, value):
        if value <= 0:
            raise serializers.ValidationError("मात्रा ० भन्दा बढी हुनुपर्छ।")
        return value
    
    def validate_required_delivery_date(self, value):
        if value and value <= timezone.now().date():
            raise serializers.ValidationError("डेलिभरी मिति भविष्यमा हुनुपर्छ।")
        return value