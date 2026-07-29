from django.contrib import admin
from django.urls import path
from products.views import product_list, product_detail, category_list, register_user, add_review , create_order , user_profile,  manage_wishlist , verify_coupon , article_detail, article_list , get_wishlist,like_review, dislike_review
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', product_list),
    path('api/products/<int:pk>/', product_detail),
    path('api/products/<int:pk>/reviews/', add_review),
    path('api/categories/', category_list),
    path('api/register/', register_user),
    # این دو خط اضافه شد:
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/orders/', create_order), # اضافه شد
    path('api/profile/', user_profile), # اضافه شد
    path('api/wishlist/<int:product_id>/', manage_wishlist), # اضافه شد
    path('api/coupons/verify/', verify_coupon), # اضافه شد
    path('api/articles/', article_list), # اضافه شد
    path('api/articles/<int:pk>/', article_detail), # اضافه شد
    path('api/wishlist/items/', get_wishlist), # اضافه شد
    path('api/reviews/<int:review_id>/like/', like_review), # اضافه شد
    path('api/reviews/<int:review_id>/dislike/', dislike_review), # اضافه شد
]