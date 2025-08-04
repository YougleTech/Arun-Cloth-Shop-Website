from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    """Extended user model for Arun Cloth Shop"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    
    # Business information
    company_name = models.CharField(max_length=200, blank=True)
    business_type = models.CharField(max_length=100, blank=True)
    gst_number = models.CharField(max_length=50, blank=True)
    
    # Address information
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    
    # Profile information
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], blank=True)
    
    # Preferences
    preferred_language = models.CharField(max_length=10, choices=[
        ('ne', 'Nepali'),
        ('en', 'English'),
        ('hi', 'Hindi')
    ], default='ne')
    
    # Business settings
    is_wholesale_customer = models.BooleanField(default=False)
    wholesale_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Timestamps
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'auth_user'
        
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def display_name(self):
        return self.full_name or self.username or self.email


class UserProfile(models.Model):
    """Additional user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Shopping preferences
    favorite_categories = models.ManyToManyField('products.Category', blank=True)
    preferred_materials = models.CharField(max_length=200, blank=True, 
                                         help_text="Comma-separated preferred materials")
    
    # Communication preferences
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=True)
    whatsapp_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    # Business information
    annual_purchase_volume = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    primary_business_category = models.CharField(max_length=100, blank=True)
    
    # Loyalty program
    loyalty_points = models.PositiveIntegerField(default=0)
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    # References
    referred_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='referrals')
    referral_code = models.CharField(max_length=20, unique=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.display_name}'s Profile"
    
    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = f"ARUN{self.user.id.hex[:8].upper()}"
        super().save(*args, **kwargs)


class UserAddress(models.Model):
    """Multiple addresses for users"""
    ADDRESS_TYPES = [
        ('home', 'Home'),
        ('office', 'Office'),
        ('warehouse', 'Warehouse'),
        ('billing', 'Billing'),
        ('shipping', 'Shipping'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_type = models.CharField(max_length=20, choices=ADDRESS_TYPES, default='home')
    
    # Address fields
    name = models.CharField(max_length=100, help_text="Address label or recipient name")
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='Nepal')
    
    # Contact info
    phone = models.CharField(max_length=15, blank=True)
    landmark = models.CharField(max_length=200, blank=True)
    
    # Settings
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
        
    def __str__(self):
        return f"{self.name} - {self.address_type}"
    
    def save(self, *args, **kwargs):
        # Ensure only one default address per user
        if self.is_default:
            UserAddress.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class EmailVerification(models.Model):
    """Email verification tokens"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    def __str__(self):
        return f"Email verification for {self.user.email}"


class PasswordResetToken(models.Model):
    """Password reset tokens"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    def is_used(self):
        return self.used_at is not None
    
    def __str__(self):
        return f"Password reset for {self.user.email}"