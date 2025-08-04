from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product
from accounts.models import UserAddress
import uuid

User = get_user_model()


class Order(models.Model):
    """Customer orders"""
    
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash_on_delivery', 'Cash on Delivery'),
        ('bank_transfer', 'Bank Transfer'),
        ('online_payment', 'Online Payment'),
        ('credit', 'Credit Account'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    
    # Customer information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    
    # Order details
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash_on_delivery')
    
    # Pricing
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Wholesale pricing (if applicable)
    is_wholesale_order = models.BooleanField(default=False)
    wholesale_discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Shipping information
    shipping_address = models.ForeignKey(UserAddress, on_delete=models.SET_NULL, null=True, 
                                       related_name='shipping_orders')
    billing_address = models.ForeignKey(UserAddress, on_delete=models.SET_NULL, null=True,
                                      related_name='billing_orders')
    
    # Delivery information
    estimated_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)
    delivery_instructions = models.TextField(blank=True)
    
    # Order notes
    customer_notes = models.TextField(blank=True, help_text="Notes from customer")
    admin_notes = models.TextField(blank=True, help_text="Internal notes")
    
    # Tracking
    tracking_number = models.CharField(max_length=100, blank=True)
    courier_service = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['order_number']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Order {self.order_number} by {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)

    def generate_order_number(self):
        """Generate unique order number"""
        import random
        import string
        from django.utils import timezone
        
        date_str = timezone.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.digits, k=4))
        return f"ARN{date_str}{random_str}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def can_cancel(self):
        return self.status in ['pending', 'confirmed']

    def calculate_totals(self):
        """Recalculate order totals"""
        self.subtotal = sum(item.total_price for item in self.items.all())
        
        # Apply wholesale discount if applicable
        if self.is_wholesale_order and self.wholesale_discount_percent > 0:
            self.discount_amount = (self.subtotal * self.wholesale_discount_percent / 100)
        
        # Calculate tax (can be customized)
        taxable_amount = self.subtotal - self.discount_amount
        self.tax_amount = taxable_amount * 0.13  # 13% VAT in Nepal
        
        self.total_amount = self.subtotal - self.discount_amount + self.tax_amount + self.shipping_cost
        
        return self.total_amount


class OrderItem(models.Model):
    """Individual items in an order"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    # Product details at time of order
    product_name = models.CharField(max_length=200)
    product_sku = models.CharField(max_length=100, blank=True)
    
    # Pricing at time of order
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    
    # Customer preferences
    preferred_colors = models.CharField(max_length=200, blank=True)
    special_instructions = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    @property
    def wholesale_total_price(self):
        return self.wholesale_price * self.quantity

    def save(self, *args, **kwargs):
        # Store product details at time of order
        if not self.product_name:
            self.product_name = self.product.name
        if not self.unit_price:
            self.unit_price = self.product.price_per_meter
        if not self.wholesale_price:
            self.wholesale_price = self.product.wholesale_price
        
        super().save(*args, **kwargs)


class OrderStatusHistory(models.Model):
    """Track order status changes"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=Order.ORDER_STATUS_CHOICES)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Order Status History"

    def __str__(self):
        return f"Order {self.order.order_number} - {self.status}"


class QuoteRequest(models.Model):
    """Customer quote requests for bulk orders"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('quoted', 'Quoted'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote_number = models.CharField(max_length=20, unique=True, editable=False)
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quote_requests')
    
    # Quote details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    
    # Requirements
    fabric_type = models.CharField(max_length=200)
    material_preference = models.CharField(max_length=200, blank=True)
    quantity_needed = models.PositiveIntegerField(help_text="Quantity in meters")
    preferred_colors = models.CharField(max_length=300)
    usage_description = models.TextField()
    quality_requirements = models.TextField(blank=True)
    
    # Delivery requirements
    delivery_location = models.TextField()
    required_delivery_date = models.DateField(null=True, blank=True)
    
    # Pricing
    budget_range = models.CharField(max_length=100, blank=True)
    quoted_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quoted_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Communication
    customer_message = models.TextField()
    admin_response = models.TextField(blank=True)
    
    # Contact preferences
    contact_via_whatsapp = models.BooleanField(default=True)
    contact_via_email = models.BooleanField(default=True)
    contact_via_phone = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    quoted_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Quote {self.quote_number} by {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.quote_number:
            self.quote_number = self.generate_quote_number()
        super().save(*args, **kwargs)

    def generate_quote_number(self):
        """Generate unique quote number"""
        import random
        import string
        from django.utils import timezone
        
        date_str = timezone.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"QT{date_str}{random_str}"

    @property
    def is_expired(self):
        from django.utils import timezone
        return self.expires_at and timezone.now() > self.expires_at

    def convert_to_order(self):
        """Convert accepted quote to an order"""
        if self.status != 'accepted':
            raise ValueError("Only accepted quotes can be converted to orders")
        
        # This would create an order based on the quote
        # Implementation depends on specific business logic
        pass