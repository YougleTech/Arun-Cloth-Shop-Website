from django.contrib import admin
from django.utils.html import format_html
from .models import Cart, CartItem, SavedItem


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items', 'total_amount', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'user__username', 'session_id')
    readonly_fields = ('id', 'total_items', 'total_amount', 'total_wholesale_amount', 'created_at', 'updated_at')
    
    def total_items(self, obj):
        return obj.total_items
    total_items.short_description = 'Total Items'
    
    def total_amount(self, obj):
        return f"रु {obj.total_amount:.2f}"
    total_amount.short_description = 'Total Amount'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart_user', 'product', 'quantity', 'unit_price', 'total_price', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('cart__user__email', 'product__name')
    readonly_fields = ('id', 'total_price', 'wholesale_total_price', 'created_at', 'updated_at')
    
    def cart_user(self, obj):
        return obj.cart.user.email
    cart_user.short_description = 'User'
    
    def total_price(self, obj):
        return f"रु {obj.total_price:.2f}"
    total_price.short_description = 'Total Price'


@admin.register(SavedItem)
class SavedItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'product__name')
    readonly_fields = ('id', 'created_at')
    
    actions = ['move_to_cart']
    
    def move_to_cart(self, request, queryset):
        """Move selected saved items to cart"""
        moved_count = 0
        for saved_item in queryset:
            try:
                saved_item.move_to_cart()
                moved_count += 1
            except Exception as e:
                self.message_user(request, f"Error moving {saved_item.product.name}: {str(e)}")
        
        if moved_count > 0:
            self.message_user(request, f"Successfully moved {moved_count} items to cart.")
    
    move_to_cart.short_description = "Move selected items to cart"