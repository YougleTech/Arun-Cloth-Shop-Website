from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, ProductImage, ProductReview


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 50px;"/>', obj.image.url)
        return "No image"
    image_preview.short_description = "Preview"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'sort_order', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    list_editable = ('is_active', 'sort_order')
    prepopulated_fields = {'slug': ('name',)} if hasattr(Category, 'slug') else {}
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'material', 'gsm', 'price_per_meter', 'stock_quantity', 'is_available', 'is_featured', 'tags')
    list_filter = ('category', 'material', 'usage', 'is_available', 'is_featured', 'tags', 'created_at')
    search_fields = ('name', 'description', 'slug')
    list_editable = ('is_available', 'is_featured', 'stock_quantity')
    readonly_fields = ('id', 'created_at', 'updated_at', 'main_image_preview')
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ()
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'short_description', 'category')
        }),
        ('Fabric Specifications', {
            'fields': ('material', 'gsm', 'width', 'primary_color', 'colors_available', 'usage', 'care_instructions')
        }),
        ('Pricing & Stock', {
            'fields': ('price_per_meter', 'wholesale_price', 'minimum_order_quantity', 'stock_quantity')
        }),
        ('Visibility & Features', {
            'fields': ('is_available', 'is_featured', 'tags')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ProductImageInline]

    def main_image_preview(self, obj):
        if obj.main_image:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.main_image)
        return "No image"
    main_image_preview.short_description = "Main Image Preview"

    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image_preview', 'is_primary', 'sort_order', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('product__name', 'alt_text')
    list_editable = ('is_primary', 'sort_order')
    readonly_fields = ('id', 'image_preview_large', 'created_at')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 50px;"/>', obj.image.url)
        return "No image"
    image_preview.short_description = "Preview"

    def image_preview_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 200px;"/>', obj.image.url)
        return "No image"
    image_preview_large.short_description = "Image Preview"


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'customer_name', 'rating', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_approved', 'created_at')
    search_fields = ('product__name', 'customer_name', 'customer_email', 'review_text')
    list_editable = ('is_approved',)
    readonly_fields = ('id', 'created_at')
    
    fieldsets = (
        ('Review Information', {
            'fields': ('product', 'customer_name', 'customer_email', 'rating', 'review_text')
        }),
        ('Moderation', {
            'fields': ('is_approved',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )