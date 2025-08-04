from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product
import uuid

User = get_user_model()


class Cart(models.Model):
    """Shopping cart for users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    session_id = models.CharField(max_length=100, null=True, blank=True, 
                                help_text="For anonymous users")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.email if self.user else self.session_id}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_amount(self):
        return sum(item.total_price for item in self.items.all())

    @property
    def total_wholesale_amount(self):
        return sum(item.wholesale_total_price for item in self.items.all())

    def clear(self):
        """Remove all items from cart"""
        self.items.all().delete()


class CartItem(models.Model):
    """Individual items in the shopping cart"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    # Store price at the time of adding to cart
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Additional specifications
    preferred_colors = models.CharField(max_length=200, blank=True,
                                      help_text="Comma-separated preferred colors")
    special_instructions = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['cart', 'product']

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    @property
    def wholesale_total_price(self):
        return self.wholesale_price * self.quantity

    def save(self, *args, **kwargs):
        # Store current prices when adding to cart
        if not self.unit_price:
            self.unit_price = self.product.price_per_meter
        if not self.wholesale_price:
            self.wholesale_price = self.product.wholesale_price
        
        # Validate quantity doesn't exceed stock
        if self.quantity > self.product.stock_quantity:
            raise ValueError(f"Quantity ({self.quantity}) exceeds available stock ({self.product.stock_quantity})")
        
        # Validate minimum order quantity
        if self.quantity < self.product.minimum_order_quantity:
            raise ValueError(f"Quantity ({self.quantity}) is less than minimum order quantity ({self.product.minimum_order_quantity})")
        
        super().save(*args, **kwargs)


class SavedItem(models.Model):
    """Items saved for later (wishlist)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']

    def __str__(self):
        return f"Saved: {self.product.name} by {self.user.email}"

    def move_to_cart(self):
        """Move this saved item to the user's cart"""
        cart, created = Cart.objects.get_or_create(user=self.user)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=self.product,
            defaults={
                'quantity': self.quantity,
                'unit_price': self.product.price_per_meter,
                'wholesale_price': self.product.wholesale_price,
            }
        )
        
        if not created:
            # If item already in cart, increase quantity
            cart_item.quantity += self.quantity
            cart_item.save()
        
        # Remove from saved items
        self.delete()
        
        return cart_item


class CartSession(models.Model):
    """Temporary cart sessions for anonymous users"""
    session_key = models.CharField(max_length=40, unique=True)
    cart_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Anonymous cart session: {self.session_key}"
    
    class Meta:
        ordering = ['-updated_at']