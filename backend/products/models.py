from django.db import models
from django.contrib.auth.models import User
class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="نام دسته‌بندی")
    image_url = models.CharField(max_length=500, blank=True, verbose_name="لینک عکس دسته‌بندی")
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200, verbose_name="نام محصول")
    description = models.TextField(verbose_name="توضیحات")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="قیمت")
    image_url = models.CharField(max_length=500, blank=True, verbose_name="لینک عکس")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="دسته‌بندی")
    stock = models.PositiveIntegerField(default=10, verbose_name="موجودی انبار")

    # این خط اضافه شد:
    is_summer_sale = models.BooleanField(default=False, verbose_name="آیا در سامرتخفیف است؟")
    # این خط اضافه شد:
    discount_percent = models.PositiveIntegerField(default=0, verbose_name="درصد تخفیف (0 تا 100)")

    def __str__(self):
        return self.name
    
class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE, verbose_name="محصول")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="کاربر")
    body = models.TextField(verbose_name="متن نظر")
    is_approved = models.BooleanField(default=False, verbose_name="تایید شده")
    likes = models.PositiveIntegerField(default=0, verbose_name="لایک‌ها")
    dislikes = models.PositiveIntegerField(default=0, verbose_name="دیسلایک‌ها")
    admin_reply = models.TextField(blank=True, null=True, verbose_name="پاسخ ادمین")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    def __str__(self):
        return f"نظر {self.user.username} برای {self.product.name}"
class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'در انتظار تایید'),
        ('Shipped', 'ارسال شده'),
        ('Delivered', 'تحویل داده شده'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="کاربر")
    full_name = models.CharField(max_length=100, verbose_name="نام و نام خانوادگی")
    phone = models.CharField(max_length=15, verbose_name="شماره تماس")
    address = models.TextField(verbose_name="آدرس پستی")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="مبلغ کل")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', verbose_name="وضعیت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    def __str__(self):
        return f"سفارش {self.id} - {self.full_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE, verbose_name="سفارش")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="محصول")
    product_name = models.CharField(max_length=200, verbose_name="نام محصول")
    quantity = models.PositiveIntegerField(default=1, verbose_name="تعداد")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="قیمت")

    def __str__(self):
        return f"{self.quantity} عدد {self.product_name}"

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="کاربر")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="محصول")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    class Meta:
        unique_together = ('user', 'product') # جلوگیری از افزودن یک محصول دو بار

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name="کد تخفیف")
    discount_percent = models.PositiveIntegerField(default=10, verbose_name="درصد تخفیف")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ساخت")
    is_first_purchase_only = models.BooleanField(default=False, verbose_name="فقط برای اولین خرید")
    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)"    

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True, null=True, verbose_name="شماره تماس")
    address = models.TextField(blank=True, null=True, verbose_name="آدرس پستی")

    def __str__(self):
        return f"پروفایل {self.user.username}"    

class Article(models.Model):
    title = models.CharField(max_length=200, verbose_name="عنوان مقاله")
    short_desc = models.CharField(max_length=300, verbose_name="خلاصه کوتاه")
    body = models.TextField(verbose_name="متن کامل مقاله")
    image_url = models.CharField(max_length=500, blank=True, verbose_name="آدرس عکس")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ انتشار")

    def __str__(self):
        return self.title
    