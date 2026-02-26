"""
إشارات المستخدمين
Signals for User Management
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import Profile, CompanySettings

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    إنشاء ملف شخصي تلقائي عند إنشاء مستخدم
    Create profile automatically when user is created
    """
    if created:
        Profile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    حفظ الملف الشخصي عند حفظ المستخدم
    Save profile when user is saved
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
