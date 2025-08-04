from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile, UserAddress, EmailVerification, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'full_name', 'phone', 'is_wholesale_customer', 
                   'email_verified', 'is_active', 'created_at')
    list_filter = ('is_wholesale_customer', 'email_verified', 'phone_verified', 
                  'is_active', 'is_staff', 'is_superuser', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone', 'company_name')
    list_editable = ('is_wholesale_customer',)
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Personal Info', {
            'fields': ('phone', 'profile_image', 'date_of_birth', 'gender')
        }),
        ('Business Info', {
            'fields': ('company_name', 'business_type', 'gst_number', 'is_wholesale_customer', 
                      'wholesale_discount', 'credit_limit')
        }),
        ('Address Info', {
            'fields': ('address', 'city', 'state', 'pincode')
        }),
        ('Preferences', {
            'fields': ('preferred_language',)
        }),
        ('Verification Status', {
            'fields': ('email_verified', 'phone_verified', 'last_login_ip')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'first_name', 'last_name', 'phone')
        }),
    )
    
    def full_name(self, obj):
        return obj.full_name or obj.username
    full_name.short_description = 'Full Name'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'loyalty_points', 'total_orders', 'total_spent', 
                   'referral_code', 'email_notifications', 'created_at')
    list_filter = ('email_notifications', 'sms_notifications', 'whatsapp_notifications', 
                  'marketing_emails', 'created_at')
    search_fields = ('user__email', 'user__username', 'referral_code')
    readonly_fields = ('referral_code', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User Info', {
            'fields': ('user',)
        }),
        ('Shopping Preferences', {
            'fields': ('favorite_categories', 'preferred_materials')
        }),
        ('Communication Preferences', {
            'fields': ('email_notifications', 'sms_notifications', 'whatsapp_notifications', 
                      'marketing_emails')
        }),
        ('Business Info', {
            'fields': ('annual_purchase_volume', 'primary_business_category')
        }),
        ('Loyalty Program', {
            'fields': ('loyalty_points', 'total_orders', 'total_spent')
        }),
        ('Referral Program', {
            'fields': ('referred_by', 'referral_code')
        }),
        ('System Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'address_type', 'city', 'state', 'is_default', 
                   'is_active', 'created_at')
    list_filter = ('address_type', 'is_default', 'is_active', 'state', 'created_at')
    search_fields = ('user__email', 'user__username', 'name', 'city', 'pincode')
    list_editable = ('is_default', 'is_active')
    
    fieldsets = (
        ('User Info', {
            'fields': ('user', 'address_type', 'name')
        }),
        ('Address Details', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'pincode', 
                      'country', 'landmark')
        }),
        ('Contact Info', {
            'fields': ('phone',)
        }),
        ('Settings', {
            'fields': ('is_default', 'is_active')
        }),
        ('System Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'token_preview', 'created_at', 'verified_at', 'expires_at', 'is_expired')
    list_filter = ('verified_at', 'created_at', 'expires_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('token', 'created_at')
    
    def token_preview(self, obj):
        return f"{obj.token[:10]}..."
    token_preview.short_description = 'Token'
    
    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token_preview', 'created_at', 'used_at', 'expires_at', 
                   'is_expired', 'is_used')
    list_filter = ('used_at', 'created_at', 'expires_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('token', 'created_at')
    
    def token_preview(self, obj):
        return f"{obj.token[:10]}..."
    token_preview.short_description = 'Token'
    
    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'
    
    def is_used(self, obj):
        return obj.is_used()
    is_used.boolean = True
    is_used.short_description = 'Used'