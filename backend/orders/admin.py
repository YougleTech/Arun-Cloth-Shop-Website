from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import Order, OrderItem, OrderStatusHistory, QuoteRequest


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('total_price', 'wholesale_total_price')
    
    def total_price(self, obj):
        return f"रु {obj.total_price:.2f}"
    total_price.short_description = 'Total Price'


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'payment_status', 'total_amount', 'is_wholesale_order', 'created_at')
    list_filter = ('status', 'payment_status', 'payment_method', 'is_wholesale_order', 'created_at')
    search_fields = ('order_number', 'user__email', 'user__username', 'tracking_number')
    readonly_fields = ('id', 'order_number', 'total_items', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Order Information', {
            'fields': ('id', 'order_number', 'user', 'status', 'payment_status', 'payment_method')
        }),
        ('Pricing', {
            'fields': ('subtotal', 'discount_amount', 'tax_amount', 'shipping_cost', 'total_amount',
                      'is_wholesale_order', 'wholesale_discount_percent')
        }),
        ('Addresses', {
            'fields': ('shipping_address', 'billing_address')
        }),
        ('Delivery Information', {
            'fields': ('estimated_delivery_date', 'actual_delivery_date', 'delivery_instructions',
                      'tracking_number', 'courier_service')
        }),
        ('Notes', {
            'fields': ('customer_notes', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'confirmed_at', 'shipped_at', 'delivered_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    actions = ['mark_as_confirmed', 'mark_as_shipped', 'mark_as_delivered']
    
    def total_amount(self, obj):
        return f"रु {obj.total_amount:.2f}"
    total_amount.short_description = 'Total Amount'
    
    def mark_as_confirmed(self, request, queryset):
        """Mark selected orders as confirmed"""
        updated = queryset.filter(status='pending').update(
            status='confirmed',
            confirmed_at=timezone.now()
        )
        
        # Create status history for each updated order
        for order in queryset.filter(status='confirmed'):
            OrderStatusHistory.objects.create(
                order=order,
                status='confirmed',
                notes='Admin द्वारा पुष्टि गरियो।',
                created_by=request.user
            )
        
        self.message_user(request, f"{updated} orders marked as confirmed.")
    
    mark_as_confirmed.short_description = "Mark selected orders as confirmed"
    
    def mark_as_shipped(self, request, queryset):
        """Mark selected orders as shipped"""
        updated = queryset.filter(status__in=['confirmed', 'processing']).update(
            status='shipped',
            shipped_at=timezone.now()
        )
        
        for order in queryset.filter(status='shipped'):
            OrderStatusHistory.objects.create(
                order=order,
                status='shipped',
                notes='Admin द्वारा पठाइयो।',
                created_by=request.user
            )
        
        self.message_user(request, f"{updated} orders marked as shipped.")
    
    mark_as_shipped.short_description = "Mark selected orders as shipped"
    
    def mark_as_delivered(self, request, queryset):
        """Mark selected orders as delivered"""
        updated = queryset.filter(status='shipped').update(
            status='delivered',
            delivered_at=timezone.now(),
            actual_delivery_date=timezone.now().date()
        )
        
        for order in queryset.filter(status='delivered'):
            OrderStatusHistory.objects.create(
                order=order,
                status='delivered',
                notes='सफलतापूर्वक डेलिभर गरियो।',
                created_by=request.user
            )
        
        self.message_user(request, f"{updated} orders marked as delivered.")
    
    mark_as_delivered.short_description = "Mark selected orders as delivered"


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'status', 'created_by', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order__order_number', 'notes')
    readonly_fields = ('created_at',)
    
    def order_number(self, obj):
        return obj.order.order_number
    order_number.short_description = 'Order Number'


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ('quote_number', 'user', 'fabric_type', 'quantity_needed', 'status', 'urgency', 'created_at')
    list_filter = ('status', 'urgency', 'created_at', 'contact_via_whatsapp', 'contact_via_email')
    search_fields = ('quote_number', 'user__email', 'fabric_type', 'delivery_location')
    readonly_fields = ('id', 'quote_number', 'is_expired', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Quote Information', {
            'fields': ('id', 'quote_number', 'user', 'status', 'urgency')
        }),
        ('Requirements', {
            'fields': ('fabric_type', 'material_preference', 'quantity_needed', 'preferred_colors',
                      'usage_description', 'quality_requirements')
        }),
        ('Delivery & Budget', {
            'fields': ('delivery_location', 'required_delivery_date', 'budget_range')
        }),
        ('Pricing', {
            'fields': ('quoted_price', 'quoted_total', 'quoted_at', 'expires_at')
        }),
        ('Communication', {
            'fields': ('customer_message', 'admin_response', 'contact_via_whatsapp', 
                      'contact_via_email', 'contact_via_phone')
        }),
        ('System Information', {
            'fields': ('is_expired', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_processing', 'mark_as_quoted']
    
    def mark_as_processing(self, request, queryset):
        """Mark selected quote requests as processing"""
        updated = queryset.filter(status='pending').update(status='processing')
        self.message_user(request, f"{updated} quote requests marked as processing.")
    
    mark_as_processing.short_description = "Mark as processing"
    
    def mark_as_quoted(self, request, queryset):
        """Mark selected quote requests as quoted"""
        updated = queryset.filter(status='processing').update(
            status='quoted',
            quoted_at=timezone.now()
        )
        self.message_user(request, f"{updated} quote requests marked as quoted.")
    
    mark_as_quoted.short_description = "Mark as quoted"