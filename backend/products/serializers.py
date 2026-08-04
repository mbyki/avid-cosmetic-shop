from rest_framework import serializers
from .models import Product, Category, Review, Order, OrderItem, Wishlist, Profile ,Article
from django.contrib.auth.models import User
from decimal import Decimal

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    is_buyer = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'name', 'body', 'created_at', 'is_buyer', 'likes', 'dislikes', 'admin_reply']

    def get_name(self, obj):
        return obj.user.username if obj.user else "کاربر ناشناس"

    def get_is_buyer(self, obj):
        from .models import Order, OrderItem
        if obj.user and obj.product:
            user_orders_ids = Order.objects.filter(user_id=obj.user.id).values_list('id', flat=True)
            return OrderItem.objects.filter(order_id__in=list(user_orders_ids), product_id=obj.product.id).exists()
        return False

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    is_in_wishlist = serializers.SerializerMethodField() # <--- این خط جا افتاده بود!
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image_url', 'category', 'category_name', 'is_summer_sale', 'discounted_price', 'reviews', 'stock' ,'is_in_wishlist' , "discount_percent"]

    def get_is_in_wishlist(self, obj):
        # چک میکند آیا کاربر لاگین کرده و این محصول در لیست علاقه‌مندی‌های اوست
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, product=obj).exists()
        return False

    def get_reviews(self, obj):
        # فقط نظرات تایید شده توسط ادمین ارسال می‌شوند
        approved_reviews = obj.reviews.filter(is_approved=True)
        return ReviewSerializer(approved_reviews, many=True).data

    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        return None

    def get_discounted_price(self, obj):
        # اگر محصول در تخفیف بود و درصدی بیشتر از 0 داشت
        if getattr(obj, 'is_summer_sale', False) and obj.discount_percent > 0:
            discount = obj.price * (Decimal(str(obj.discount_percent)) / Decimal('100'))
            return obj.price - discount
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone']

    # چک کردن اینکه آیا ایمیل قبلاً ثبت شده است یا خیر
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("کاربری با این ایمیل قبلاً ثبت نام کرده است.")
        return value

    # چک کردن اینکه آیا شماره تماس قبلاً ثبت شده است یا خیر
    def validate_phone(self, value):
        if Profile.objects.filter(phone=value).exists():
            raise serializers.ValidationError("این شماره تماس قبلاً ثبت شده است.")
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        # ذخیره شماره تماس در پروفایل کاربر (با توجه به اینکه سیگنال پروفایل را ساخته است)
        profile, created = Profile.objects.get_or_create(user=user)
        profile.phone = phone
        profile.save()
        return user

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_name', 'quantity', 'price']

class OrderHistorySerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'total_price', 'status', 'status_display', 'created_at', 'items']


class UserProfileSerializer(serializers.ModelSerializer):
    orders = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'address', 'orders']

    def get_phone(self, obj):
        # اگر پروفایل نداشت، آن را می‌سازد
        profile, created = Profile.objects.get_or_create(user=obj)
        return profile.phone or ""

    def get_address(self, obj):
        profile, created = Profile.objects.get_or_create(user=obj)
        return profile.address or ""

    def get_orders(self, obj):
        orders = Order.objects.filter(user=obj).order_by('-created_at')
        return OrderHistorySerializer(orders, many=True).data

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        profile, created = Profile.objects.get_or_create(user=instance)
        profile.phone = self.initial_data.get('phone', profile.phone)
        profile.address = self.initial_data.get('address', profile.address)
        profile.save()

        return instance

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'    