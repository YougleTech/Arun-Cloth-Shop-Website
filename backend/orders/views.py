from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from cart.models import Cart
from accounts.models import UserAddress
from .models import Order, OrderItem, OrderStatusHistory, QuoteRequest
from .serializers import (
    OrderListSerializer, OrderDetailSerializer, CreateOrderSerializer,
    OrderStatusHistorySerializer, QuoteRequestSerializer, CreateQuoteRequestSerializer
)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Order management for customers"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderListSerializer
    
    def list(self, request):
        """Get user's order history"""
        queryset = self.get_queryset().order_by('-created_at')
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        """Create order from shopping cart"""
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            return self._create_order_from_cart(request, serializer.validated_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _create_order_from_cart(self, request, validated_data):
        """Internal method to create order from cart"""
        
        with transaction.atomic():
            # Get user's cart
            try:
                cart = Cart.objects.get(user=request.user)
            except Cart.DoesNotExist:
                return Response({
                    'error': 'कार्ट खाली छ।'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not cart.items.exists():
                return Response({
                    'error': 'कार्ट खाली छ।'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get addresses
            shipping_address = get_object_or_404(
                UserAddress, 
                id=validated_data['shipping_address_id'], 
                user=request.user
            )
            
            billing_address = shipping_address
            if not validated_data.get('use_shipping_as_billing') and validated_data.get('billing_address_id'):
                billing_address = get_object_or_404(
                    UserAddress,
                    id=validated_data['billing_address_id'],
                    user=request.user
                )
            
            # Calculate order totals
            is_wholesale = request.user.is_wholesale_customer
            subtotal = cart.total_wholesale_amount if is_wholesale else cart.total_amount
            
            discount_amount = 0
            if is_wholesale and request.user.wholesale_discount > 0:
                discount_amount = subtotal * (request.user.wholesale_discount / 100)
            
            taxable_amount = subtotal - discount_amount
            tax_amount = taxable_amount * 0.13  # 13% VAT
            
            # Calculate shipping
            shipping_cost = self._calculate_shipping_cost(cart, request.user)
            
            total_amount = subtotal - discount_amount + tax_amount + shipping_cost
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                shipping_address=shipping_address,
                billing_address=billing_address,
                payment_method=validated_data['payment_method'],
                subtotal=subtotal,
                discount_amount=discount_amount,
                tax_amount=tax_amount,
                shipping_cost=shipping_cost,
                total_amount=total_amount,
                is_wholesale_order=is_wholesale,
                wholesale_discount_percent=request.user.wholesale_discount if is_wholesale else 0,
                delivery_instructions=validated_data.get('delivery_instructions', ''),
                customer_notes=validated_data.get('customer_notes', ''),
                estimated_delivery_date=self._calculate_delivery_date(),
            )
            
            # Create order items from cart items
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    quantity=cart_item.quantity,
                    unit_price=cart_item.unit_price,
                    wholesale_price=cart_item.wholesale_price,
                    preferred_colors=cart_item.preferred_colors,
                    special_instructions=cart_item.special_instructions,
                )
                
                # Update product stock
                product = cart_item.product
                product.stock_quantity -= cart_item.quantity
                product.save()
            
            # Create initial status history
            OrderStatusHistory.objects.create(
                order=order,
                status='pending',
                notes='आदेश सिर्जना गरियो।',
                created_by=request.user
            )
            
            # Clear cart
            cart.clear()
            
            # Serialize response
            serializer = OrderDetailSerializer(order)
            
            return Response({
                'message': 'आदेश सफलतापूर्वक बनाइयो।',
                'order': serializer.data
            }, status=status.HTTP_201_CREATED)
    
    def _calculate_shipping_cost(self, cart, user):
        """Calculate shipping cost"""
        base_shipping = 100
        
        if user.is_wholesale_customer or cart.total_amount > 5000:
            return 0
        
        return base_shipping
    
    def _calculate_delivery_date(self):
        """Calculate estimated delivery date"""
        from datetime import timedelta
        return timezone.now().date() + timedelta(days=7)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        order = self.get_object()
        
        if not order.can_cancel:
            return Response({
                'error': 'यो आदेश रद्द गर्न सकिँदैन।'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Update order status
            order.status = 'cancelled'
            order.save()
            
            # Restore product stock
            for item in order.items.all():
                product = item.product
                product.stock_quantity += item.quantity
                product.save()
            
            # Add status history
            OrderStatusHistory.objects.create(
                order=order,
                status='cancelled',
                notes='ग्राहकद्वारा रद्द गरियो।',
                created_by=request.user
            )
        
        return Response({'message': 'आदेश रद्द गरियो।'})
    
    @action(detail=True, methods=['get'])
    def status_history(self, request, pk=None):
        """Get order status history"""
        order = self.get_object()
        history = order.status_history.all()
        serializer = OrderStatusHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get order dashboard statistics"""
        user_orders = self.get_queryset()
        
        stats = {
            'total_orders': user_orders.count(),
            'pending_orders': user_orders.filter(status='pending').count(),
            'confirmed_orders': user_orders.filter(status='confirmed').count(),
            'shipped_orders': user_orders.filter(status='shipped').count(),
            'delivered_orders': user_orders.filter(status='delivered').count(),
            'cancelled_orders': user_orders.filter(status='cancelled').count(),
            'total_spent': float(user_orders.filter(
                payment_status='paid'
            ).aggregate(total=models.Sum('total_amount'))['total'] or 0),
        }
        
        return Response(stats)


class QuoteRequestViewSet(viewsets.ModelViewSet):
    """Quote request management"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return QuoteRequest.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['create']:
            return CreateQuoteRequestSerializer
        return QuoteRequestSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create a new quote request"""
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            quote_request = serializer.save()
            
            # TODO: Send notification to admin
            # TODO: If WhatsApp enabled, send WhatsApp message
            
            response_serializer = QuoteRequestSerializer(quote_request)
            return Response({
                'message': 'कोटेशन अनुरोध सफलतापूर्वक पठाइयो।',
                'quote_request': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def accept_quote(self, request, pk=None):
        """Accept a quote and convert to order"""
        quote_request = self.get_object()
        
        if quote_request.status != 'quoted':
            return Response({
                'error': 'केवल कोटेड अनुरोधहरू स्वीकार गर्न सकिन्छ।'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if quote_request.is_expired:
            return Response({
                'error': 'यो कोटेशन समाप्त भइसकेको छ।'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update quote status
        quote_request.status = 'accepted'
        quote_request.save()
        
        # TODO: Create order from quote
        # This would involve creating an order based on the quote details
        
        return Response({
            'message': 'कोटेशन स्वीकार गरियो। आदेश बनाइँदै छ।'
        })
    
    @action(detail=True, methods=['post'])
    def reject_quote(self, request, pk=None):
        """Reject a quote"""
        quote_request = self.get_object()
        
        if quote_request.status not in ['quoted', 'pending']:
            return Response({
                'error': 'यो कोटेशन अस्वीकार गर्न सकिँदैन।'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        quote_request.status = 'rejected'
        quote_request.save()
        
        return Response({'message': 'कोटेशन अस्वीकार गरियो।'})


# Import models for the stats function
from django.db import models