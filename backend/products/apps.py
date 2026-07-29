from django.apps import AppConfig

class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'

    # این متد اضافه شد تا سیگنال‌ها را لود کند
    def ready(self):
        import products.signals