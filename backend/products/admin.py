from django.contrib import admin

from .models import Product, Category, Review, Order, OrderItem, Wishlist, Coupon
from .models import Article
admin.site.register(Article)
admin.site.register(Coupon)
admin.site.register(Wishlist)
# ثبت محصولات
admin.site.register(Product)

# ثبت دسته‌بندی‌ها (این بخش اضافه شد)
admin.site.register(Category)

from .models import Product, Category, Review, Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'quantity', 'price')

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'phone', 'total_price', 'status', 'created_at']
    inlines = [OrderItemInline]

admin.site.register(Order, OrderAdmin)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'body', 'is_approved', 'likes', 'dislikes', 'created_at')
    list_filter = ('is_approved', 'created_at')
    actions = ['approve_reviews']
    # فیلدهای ویرایش: بدنه نظر فقط خواندنی است، ادمین فقط پاسخ را می‌نویسد
    readonly_fields = ('product', 'user', 'body', 'likes', 'dislikes', 'created_at')
    fields = ('is_approved', 'admin_reply', 'product', 'user', 'body', 'likes', 'dislikes', 'created_at')

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "تایید نظرات انتخاب شده"