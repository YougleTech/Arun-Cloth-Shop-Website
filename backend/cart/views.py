from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from products.models import Product
from .models import Cart, CartItem, SavedItem
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer,
    UpdateCartItemSerializer, SavedItemSerializer, MoveToCartSerializer
)


class CartViewSet(viewsets.ModelViewSet):
    """Shopping cart management"""
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only access their own cart
        return Cart.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Get or create cart for the current user
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    def list(self, request):
        """Get current user's cart"""
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to cart"""
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            cart = self.get_object()
            product = get_object_or_404(Product, id=serializer.validated_data['product_id'])
            
            # Check if item already in cart
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={
                    'quantity': serializer.validated_data['quantity'],
                    'preferred_colors': serializer.validated_data.get('preferred_colors', ''),
                    'special_instructions': serializer.validated_data.get('special_instructions', ''),
                }
            )
            
            if not created:
                # Update existing item
                cart_item.quantity += serializer.validated_data['quantity']
                
                # Validate total quantity doesn't exceed stock
                if cart_item.quantity > product.stock_quantity:
                    return Response({
                        'error': f'कुल मात्रा ({cart_item.quantity}) स्टकमा उपलब्ध मात्रा ({product.stock_quantity}) भन्दा बढी छ।'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                cart_item.save()
            
            cart_serializer = CartSerializer(cart)
            return Response({
                'message': 'उत्पादन कार्टमा थपियो।',
                'cart': cart_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['put'])
    def update_item(self, request):
        """Update cart item quantity"""
        item_id = request.data.get('item_id')
        if not item_id:
            return Response({'error': 'आइटम ID आवश्यक छ।'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UpdateCartItemSerializer(data=request.data)
        if serializer.is_valid():
            cart = self.get_object()
            
            try:
                cart_item = cart.items.get(id=item_id)
                
                # Validate quantity doesn't exceed stock
                new_quantity = serializer.validated_data['quantity']
                if new_quantity > cart_item.product.stock_quantity:
                    return Response({
                        'error': f'मात्रा ({new_quantity}) स्टकमा उपलब्ध मात्रा ({cart_item.product.stock_quantity}) भन्दा बढी छ।'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Validate minimum order quantity
                if new_quantity < cart_item.product.minimum_order_quantity:
                    return Response({
                        'error': f'मात्रा ({new_quantity}) न्यूनतम अर्डर मात्रा ({cart_item.product.minimum_order_quantity}) भन्दा कम छ।'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                cart_item.quantity = new_quantity
                cart_item.preferred_colors = serializer.validated_data.get('preferred_colors', cart_item.preferred_colors)
                cart_item.special_instructions = serializer.validated_data.get('special_instructions', cart_item.special_instructions)
                cart_item.save()
                
                cart_serializer = CartSerializer(cart)
                return Response({
                    'message': 'कार्ट अपडेट भयो।',
                    'cart': cart_serializer.data
                })
                
            except CartItem.DoesNotExist:
                return Response({'error': 'कार्ट आइटम फेला परेन।'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Remove item from cart"""
        item_id = request.data.get('item_id')
        if not item_id:
            return Response({'error': 'आइटम ID आवश्यक छ।'}, status=status.HTTP_400_BAD_REQUEST)
        
        cart = self.get_object()
        
        try:
            cart_item = cart.items.get(id=item_id)
            cart_item.delete()
            
            cart_serializer = CartSerializer(cart)
            return Response({
                'message': 'आइटम कार्टबाट हटाइयो।',
                'cart': cart_serializer.data
            })
            
        except CartItem.DoesNotExist:
            return Response({'error': 'कार्ट आइटम फेला परेन।'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from cart"""
        cart = self.get_object()
        cart.clear()
        
        cart_serializer = CartSerializer(cart)
        return Response({
            'message': 'कार्ट खाली गरियो।',
            'cart': cart_serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def save_for_later(self, request):
        """Move cart item to saved items"""
        item_id = request.data.get('item_id')
        if not item_id:
            return Response({'error': 'आइटम ID आवश्यक छ।'}, status=status.HTTP_400_BAD_REQUEST)
        
        cart = self.get_object()
        
        try:
            cart_item = cart.items.get(id=item_id)
            
            # Create saved item
            saved_item, created = SavedItem.objects.get_or_create(
                user=request.user,
                product=cart_item.product,
                defaults={
                    'quantity': cart_item.quantity,
                    'notes': cart_item.special_instructions
                }
            )
            
            if not created:
                saved_item.quantity = cart_item.quantity
                saved_item.notes = cart_item.special_instructions
                saved_item.save()
            
            # Remove from cart
            cart_item.delete()
            
            return Response({'message': 'आइटम पछिका लागि सेभ गरियो।'})
            
        except CartItem.DoesNotExist:
            return Response({'error': 'कार्ट आइटम फेला परेन।'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get cart summary for checkout"""
        cart = self.get_object()
        
        # Calculate pricing
        is_wholesale = request.user.is_wholesale_customer
        subtotal = cart.total_wholesale_amount if is_wholesale else cart.total_amount
        
        # Calculate discount
        discount_amount = 0
        if is_wholesale and request.user.wholesale_discount > 0:
            discount_amount = subtotal * (request.user.wholesale_discount / 100)
        
        # Calculate tax (13% VAT in Nepal)
        taxable_amount = subtotal - discount_amount
        tax_amount = taxable_amount * 0.13
        
        # Shipping cost (can be dynamic based on location/weight)
        shipping_cost = self.calculate_shipping_cost(cart, request.user)
        
        total_amount = subtotal - discount_amount + tax_amount + shipping_cost
        
        return Response({
            'items_count': cart.total_items,
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'tax_amount': tax_amount,
            'shipping_cost': shipping_cost,
            'total_amount': total_amount,
            'is_wholesale_order': is_wholesale,
            'wholesale_discount_percent': request.user.wholesale_discount if is_wholesale else 0,
        })
    
    def calculate_shipping_cost(self, cart, user):
        """Calculate shipping cost based on various factors"""
        # Simple shipping calculation - can be made more complex
        base_shipping = 100  # Base shipping cost in NPR
        
        # Free shipping for wholesale customers or orders above certain amount
        if user.is_wholesale_customer or cart.total_amount > 5000:
            return 0
        
        return base_shipping


class SavedItemViewSet(viewsets.ModelViewSet):
    """Saved items (wishlist) management"""
    serializer_class = SavedItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavedItem.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def move_to_cart(self, request, pk=None):
        """Move saved item to cart"""
        saved_item = self.get_object()
        
        try:
            cart_item = saved_item.move_to_cart()
            return Response({
                'message': 'आइटम कार्टमा सारियो।',
                'cart_item_id': str(cart_item.id)
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)