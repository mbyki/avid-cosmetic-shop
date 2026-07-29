from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile

# این تابع هر بار که یک کاربر جدید ساخته شد (یا در پنل ادمین ثبت شد)، اجرا می‌شود
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

# این تابع هر بار که اطلاعات کاربر ذخیره شد، پروفایلش را هم ذخیره کند
@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    # اگر کاربر پروفایل داشت، آن را ذخیره کن (جلوگیری از ارور اگر هنوز پروفایل ساخته نشده)
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        pass