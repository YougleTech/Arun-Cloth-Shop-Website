from rest_framework import serializers
from .models import Cart, CartItem, SavedItem
from products.serializers import ProductListSerializer
from decimal import Decimal


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    unit_price = serializers.SerializerMethodField()
    wholesale_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    wholesale_total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 'unit_price', 'wholesale_price',
            'total_price', 'wholesale_total_price', 'preferred_colors',
            'special_instructions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def _is_staff(self):
        request = self.context.get('request')
        return getattr(request, 'user', None) and request.user.is_staff

    def get_unit_price(self, obj):
        return str(obj.unit_price) if self._is_staff() else None

    def get_wholesale_price(self, obj):
        return str(obj.wholesale_price) if self._is_staff() else None

    def get_total_price(self, obj):
        return str(obj.total_price) if self._is_staff() else None

    def get_wholesale_total_price(self, obj):
        return str(obj.wholesale_total_price) if self._is_staff() else None

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("मात्रा ० भन्दा बढी हुनुपर्छ।")
        return value

    def validate(self, attrs):
        product_id = attrs.get('product_id')
        quantity = attrs.get('quantity')

        if product_id and quantity:
            from products.models import Product
            try:
                product = Product.objects.get(id=product_id)

                if quantity > product.stock_quantity:
                    raise serializers.ValidationError(
                        f"मात्रा ({quantity}) स्टकमा उपलब्ध मात्रा ({product.stock_quantity}) भन्दा बढी छ।"
                    )

                if quantity < product.minimum_order_quantity:
                    raise serializers.ValidationError(
                        f"मात्रा ({quantity}) न्यूनतम अर्डर मात्रा ({product.minimum_order_quantity}) भन्दा कम छ।"
                    )

            except Product.DoesNotExist:
                raise serializers.ValidationError("उत्पादन फेला परेन।")

        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    total_items = serializers.IntegerField(read_only=True)
    total_amount = serializers.SerializerMethodField()
    total_wholesale_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id', 'items', 'total_items', 'total_amount', 'total_wholesale_amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def _is_staff(self):
        request = self.context.get('request')
        return getattr(request, 'user', None) and request.user.is_staff

    def get_items(self, obj):
        return CartItemSerializer(obj.items.all(), many=True, context=self.context).data

    def get_total_amount(self, obj):
        return str(obj.total_amount) if self._is_staff() else None

    def get_total_wholesale_amount(self, obj):
        return str(obj.total_wholesale_amount) if self._is_staff() else None


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    preferred_colors = serializers.CharField(max_length=200, required=False, allow_blank=True)
    special_instructions = serializers.CharField(required=False, allow_blank=True)

    def validate_product_id(self, value):
        from products.models import Product
        try:
            product = Product.objects.get(id=value, is_available=True)
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("उत्पादन फेला परेन वा उपलब्ध छैन।")

    def validate(self, attrs):
        from products.models import Product
        product_id = attrs['product_id']
        quantity = attrs['quantity']

        product = Product.objects.get(id=product_id)

        if quantity > product.stock_quantity:
            raise serializers.ValidationError(
                f"मात्रा ({quantity}) स्टकमा उपलब्ध मात्रा ({product.stock_quantity}) भन्दा बढी छ।"
            )

        if quantity < product.minimum_order_quantity:
            raise serializers.ValidationError(
                f"मात्रा ({quantity}) न्यूनतम अर्डर मात्रा ({product.minimum_order_quantity}) भन्दा कम छ।"
            )

        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    preferred_colors = serializers.CharField(max_length=200, required=False, allow_blank=True)
    special_instructions = serializers.CharField(required=False, allow_blank=True)


class SavedItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = SavedItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_product_id(self, value):
        from products.models import Product
        try:
            Product.objects.get(id=value, is_available=True)
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("उत्पादन फेला परेन वा उपलब्ध छैन।")


class MoveToCartSerializer(serializers.Serializer):
    """Serializer for moving saved items to cart"""
    pass
