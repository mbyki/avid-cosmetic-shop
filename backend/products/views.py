from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination # این خط اضافه شد
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Product, Category, Review, Order, OrderItem, Wishlist, Coupon, Profile, Article
from rest_framework import status
from .serializers import ProductSerializer, CategorySerializer, RegisterSerializer, ReviewSerializer, UserProfileSerializer, ArticleSerializer

from django.db.models import Case, When, F, FloatField, Sum, Value, IntegerField
from django.db.models.functions import Coalesce
from decimal import Decimal

from django.db.models import Prefetch # این خط را به بالای فایل (بخش import ها) اضافه کن

@api_view(['GET'])
def product_list(request):
    search_query = request.GET.get('search', None)
    is_summer = request.GET.get('summer', None)
    category_id = request.GET.get('category', None)
    min_price = request.GET.get('min_price', None)
    max_price = request.GET.get('max_price', None)
    ordering = request.GET.get('ordering', None)
    
    # ۱. بهینه‌سازی اولیه: آوردن دسته‌بندی و نظرات تایید شده همزمان با محصول
        # ۱. بهینه‌سازی و محاسبه قیمت نهایی و تعداد فروش
    products = Product.objects.select_related('category').prefetch_related(
        Prefetch('reviews', queryset=Review.objects.filter(is_approved=True))
    ).annotate(
        final_price=Case(
            When(is_summer_sale=True, then=F('price') * Decimal('0.75')),
            default=F('price'),
            output_field=FloatField()
        ),
        # این بخش اضافه شد تا تعداد فروش هر محصول محاسبه شود (اگر فروش نداشت 0 در نظر گرفته شود)
        total_sold=Coalesce(Sum('orderitem__quantity'), Value(0), output_field=IntegerField())
    )
    
    if search_query:
        products = products.filter(name__icontains=search_query)
    if is_summer == 'true':
        products = products.filter(is_summer_sale=True)
    if category_id:
        products = products.filter(category_id=category_id)
    if min_price:
        products = products.filter(final_price__gte=min_price)
    if max_price:
        products = products.filter(final_price__lte=max_price)
        
    if ordering == 'cheap':
        products = products.order_by('final_price')
    elif ordering == 'expensive':
        products = products.order_by('-final_price')
    elif ordering == 'newest':
        products = products.order_by('-id')
    elif ordering == 'best_seller':
        products = products.order_by('-total_sold')    
    paginator = PageNumberPagination()
    paginator.page_size = 8
    result_page = paginator.paginate_queryset(products, request)
    serializer = ProductSerializer(result_page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data) 


@api_view(['GET'])
def product_detail(request, pk):
    # بهینه‌سازی: آوردن دسته‌بندی و نظرات تایید شده همزمان با محصول
    product = get_object_or_404(
        Product.objects.select_related('category').prefetch_related(
            Prefetch('reviews', queryset=Review.objects.filter(is_approved=True))
        ), 
        id=pk
    )
    serializer = ProductSerializer(product, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "ثبت نام با موفقیت انجام شد!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated]) # فقط کاربران لاگین شده می‌توانند نظر ثبت کنند
def add_review(request, pk):
    product = get_object_or_404(Product, id=pk)
    body = request.data.get('body')
    
    if not body:
        return Response({"error": "متن نظر الزامی است"}, status=status.HTTP_400_BAD_REQUEST)
        
    review = Review.objects.create(product=product, user=request.user, body=body)
    serializer = ReviewSerializer(review)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    data = request.data
    items = data.get('items', [])
    coupon_code = data.get('coupon_code', None)
    
    if not items:
        return Response({"error": "سبد خرید خالی است"}, status=status.HTTP_400_BAD_REQUEST)
    
    # بررسی موجودی انبار
    for item in items:
        try:
            product = Product.objects.get(id=item.get('id'))
            if product.stock < item.get('quantity'):
                return Response({"error": f"موجودی محصول {product.name} کافی نیست."}, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({"error": "یکی از محصولات یافت نشد."}, status=status.HTTP_400_BAD_REQUEST)
    
    # دریافت یا ساخت پروفایل کاربر
    # دریافت یا ساخت پروفایل کاربر
    profile, created = Profile.objects.get_or_create(user=request.user)
    
    # دریافت اطلاعات از فرم تسویه حساب
    input_full_name = data.get('full_name')
    input_phone = data.get('phone')
    input_address = data.get('address')
    
    # اگر کاربر در فرم چیزی وارد کرد و پروفایلش خالی بود، پروفایل را آپدیت کن
    if input_phone and not profile.phone:
        profile.phone = input_phone
    if input_address and not profile.address:
        profile.address = input_address
    profile.save()
    
    # آپدیت نام و نام خانوادگی کاربر اگر خالی بود
    if input_full_name and not request.user.first_name:
        name_parts = input_full_name.split(' ', 1)
        request.user.first_name = name_parts[0]
        if len(name_parts) > 1:
            request.user.last_name = name_parts[1]
        request.user.save()
        
    # استفاده از اطلاعات فرم (یا پروفایل به عنوان fallback)
    full_name = input_full_name or f"{request.user.first_name} {request.user.last_name}"
    phone = input_phone or profile.phone
    address = input_address or profile.address
    
    if not phone or not address:
        return Response({"error": "اطلاعات تماس و آدرس الزامی است."}, status=status.HTTP_400_BAD_REQUEST)
    # محاسبه مبلغ کل
    total = sum(float(item['price']) * item['quantity'] for item in items)
    
        # اعمال کد تخفیف
    if coupon_code:
        try:
            coupon = Coupon.objects.get(code=coupon_code, is_active=True)
            
            # چک مجدد در لحظه ثبت سفارش برای اطمینان
            if coupon.is_first_purchase_only:
                has_ordered_before = Order.objects.filter(user=request.user).exists()
                if has_ordered_before:
                    return Response({"error": "این کد تخفیف فقط برای اولین خرید قابل استفاده است و شما قبلا خرید داشته‌اید."}, status=status.HTTP_400_BAD_REQUEST)
            
            discount_amount = total * (coupon.discount_percent / 100)
            total = total - discount_amount
        except Coupon.DoesNotExist:
            pass # اگر کد نامعتبر بود، سفارش با قیمت عادی ثبت می‌شود
            
    order = Order.objects.create(
        user=request.user,
        full_name=full_name,
        phone=phone,
        address=address,
        total_price=total
    )
    
    for item in items:
        product = Product.objects.get(id=item.get('id'))
        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=item['name'],
            quantity=item['quantity'],
            price=item['price']
        )
        product.stock -= item['quantity']
        product.save()
        
    return Response({"message": "سفارش شما با موفقیت ثبت شد!", "order_id": order.id}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    
    if request.method == 'PUT':
        # استفاده از سریالایزر برای آپدیت اطلاعات کاربر و پروفایل
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    # گرفتن اطلاعات کاربر
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    if request.method == 'POST':
        # افزودن به علاقه‌مندی (اگر قبلا نبوده باشد)
        item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        return Response({"message": "به علاقه‌مندی‌ها اضافه شد", "is_in_wishlist": True}, status=status.HTTP_201_CREATED)
        
    elif request.method == 'DELETE':
        # حذف از علاقه‌مندی
        Wishlist.objects.filter(user=request.user, product=product).delete()
        return Response({"message": "از علاقه‌مندی‌ها حذف شد", "is_in_wishlist": False}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_coupon(request):
    code = request.data.get('code', '')
    try:
        coupon = Coupon.objects.get(code=code, is_active=True)
        
        # بررسی اگر کد فقط برای اولین خرید است
        if coupon.is_first_purchase_only:
            has_ordered_before = Order.objects.filter(user=request.user).exists()
            if has_ordered_before:
                return Response({"error": "این کد تخفیف فقط برای اولین خرید قابل استفاده است."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": "کد تخفیف با موفقیت اعمال شد!",
            "discount_percent": coupon.discount_percent
        }, status=status.HTTP_200_OK)
    except Coupon.DoesNotExist:
        return Response({"error": "کد تخفیف نامعتبر یا منقضی شده است."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def article_list(request):
    articles = Article.objects.all().order_by('-created_at')
    serializer = ArticleSerializer(articles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def article_detail(request, pk):
    article = get_object_or_404(Article, id=pk)
    serializer = ArticleSerializer(article)
    return Response(serializer.data)    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product__category').prefetch_related('product__reviews')
    products = [item.product for item in wishlist_items]
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def like_review(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    action = request.data.get('action', 'add')
    if action == 'add':
        review.likes += 1
    elif action == 'remove' and review.likes > 0:
        review.likes -= 1
    review.save()
    return Response({"likes": review.likes}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def dislike_review(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    action = request.data.get('action', 'add')
    if action == 'add':
        review.dislikes += 1
    elif action == 'remove' and review.dislikes > 0:
        review.dislikes -= 1
    review.save()
    return Response({"dislikes": review.dislikes}, status=status.HTTP_200_OK)