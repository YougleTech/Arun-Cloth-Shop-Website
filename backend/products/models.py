from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Category(models.Model):
    """Product categories for fabric classification"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """Main product model for fabrics"""
    
    # Product tags choices
    TAG_CHOICES = [
        ('new', 'New'),
        ('hot', 'Hot'),
        ('sale', 'Sale'),
        ('premium', 'Premium'),
        ('bestseller', 'Best Seller'),
    ]
    
    # Material choices
    MATERIAL_CHOICES = [
        ('cotton', 'Cotton'),
        ('silk', 'Silk'),
        ('wool', 'Wool'),
        ('polyester', 'Polyester'),
        ('linen', 'Linen'),
        ('rayon', 'Rayon'),
        ('chiffon', 'Chiffon'),
        ('georgette', 'Georgette'),
        ('crepe', 'Crepe'),
        ('denim', 'Denim'),
        ('lycra', 'Lycra'),
        ('net', 'Net'),
        ('satin', 'Satin'),
        ('velvet', 'Velvet'),
        ('khadi', 'Khadi'),
        ('other', 'Other'),
    ]
    
    # Usage choices
    USAGE_CHOICES = [
        ('shirt', 'Shirt'),
        ('trouser', 'Trouser'),
        ('suit', 'Suit'),
        ('dress', 'Dress'),
        ('curtain', 'Curtain'),
        ('bedsheet', 'Bed Sheet'),
        ('saree', 'Saree'),
        ('salwar', 'Salwar Suit'),
        ('lehenga', 'Lehenga'),
        ('ethnic_wear', 'Ethnic Wear'),
        ('casual_wear', 'Casual Wear'),
        ('formal_wear', 'Formal Wear'),
        ('home_decor', 'Home Decor'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    
    # Fabric specifications
    material = models.CharField(max_length=50, choices=MATERIAL_CHOICES)
    gsm = models.PositiveIntegerField(help_text="GSM (Grams per Square Meter)")
    width = models.CharField(max_length=50, help_text="Width in inches")
    
    # Colors available
    colors_available = models.TextField(help_text="Comma-separated list of available colors")
    primary_color = models.CharField(max_length=50)
    
    # Usage and care
    usage = models.CharField(max_length=50, choices=USAGE_CHOICES)
    care_instructions = models.TextField(blank=True)
    
    # Pricing
    price_per_meter = models.DecimalField(max_digits=10, decimal_places=2)
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Wholesale price for bulk orders")
    minimum_order_quantity = models.PositiveIntegerField(default=1, help_text="Minimum quantity in meters")
    
    # Stock and availability
    stock_quantity = models.PositiveIntegerField(default=0, help_text="Stock in meters")
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Tags and promotions
    tags = models.CharField(max_length=50, choices=TAG_CHOICES, blank=True)
    
    # SEO and metadata
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.CharField(max_length=300, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Admin fields
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'is_available']),
            models.Index(fields=['material', 'gsm']),
            models.Index(fields=['price_per_meter']),
        ]

    def __str__(self):
        return self.name

    @property
    def main_image(self):
        """Get the first image as main image"""
        first_image = self.images.first()
        return first_image.image.url if first_image else None
    
    @property
    def available_colors_list(self):
        """Return colors as a list"""
        return [color.strip() for color in self.colors_available.split(',') if color.strip()]
    
    @property
    def is_in_stock(self):
        """Check if product is in stock"""
        return self.stock_quantity > 0 and self.is_available


class ProductImage(models.Model):
    """Product images model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"Image for {self.product.name}"

    def save(self, *args, **kwargs):
        # Ensure only one primary image per product
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class ProductReview(models.Model):
    """Product reviews and ratings"""
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    rating = models.PositiveIntegerField(choices=RATING_CHOICES)
    review_text = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for {self.product.name} by {self.customer_name}"