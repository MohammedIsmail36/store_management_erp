"""
نماذج النواة
Core Models for System Settings and Audit
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
import json

User = get_user_model()


class AuditLog(models.Model):
    """
    سجل المراجعة
    Audit Log for tracking all changes
    """
    
    class ActionType(models.TextChoices):
        CREATE = 'create', _('إنشاء')
        UPDATE = 'update', _('تعديل')
        DELETE = 'delete', _('حذف')
        POST = 'post', _('ترحيل')
        CANCEL = 'cancel', _('إلغاء')
        LOGIN = 'login', _('تسجيل دخول')
        LOGOUT = 'logout', _('تسجيل خروج')
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('المستخدم'),
        related_name='audit_logs'
    )
    action = models.CharField(
        _('نوع العملية'),
        max_length=20,
        choices=ActionType.choices
    )
    model_name = models.CharField(
        _('اسم النموذج'),
        max_length=100
    )
    object_id = models.CharField(
        _('معرف الكائن'),
        max_length=100,
        blank=True,
        null=True
    )
    object_repr = models.CharField(
        _('تمثيل الكائن'),
        max_length=255,
        blank=True,
        null=True
    )
    old_data = models.JSONField(
        _('البيانات القديمة'),
        encoder=json.JSONEncoder,
        blank=True,
        null=True
    )
    new_data = models.JSONField(
        _('البيانات الجديدة'),
        encoder=json.JSONEncoder,
        blank=True,
        null=True
    )
    ip_address = models.GenericIPAddressField(
        _('عنوان IP'),
        blank=True,
        null=True
    )
    user_agent = models.TextField(
        _('وكيل المستخدم'),
        blank=True,
        null=True
    )
    timestamp = models.DateTimeField(
        _('التاريخ والوقت'),
        auto_now_add=True
    )
    
    class Meta:
        verbose_name = _('سجل مراجعة')
        verbose_name_plural = _('سجلات المراجعة')
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.model_name} - {self.timestamp}"
    
    @classmethod
    def log_action(cls, user, action, model_name, object_id=None, 
                   object_repr=None, old_data=None, new_data=None,
                   ip_address=None, user_agent=None):
        """
        تسجيل عملية في سجل المراجعة
        Log an action in audit log
        """
        return cls.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=str(object_id) if object_id else None,
            object_repr=object_repr,
            old_data=old_data,
            new_data=new_data,
            ip_address=ip_address,
            user_agent=user_agent
        )


class SystemSettings(models.Model):
    """
    إعدادات النظام
    System-wide settings
    """
    
    key = models.CharField(
        _('المفتاح'),
        max_length=100,
        unique=True
    )
    value = models.JSONField(
        _('القيمة'),
        encoder=json.JSONEncoder
    )
    description = models.TextField(
        _('الوصف'),
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(
        _('تاريخ الإنشاء'),
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _('تاريخ التحديث'),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _('إعداد النظام')
        verbose_name_plural = _('إعدادات النظام')
    
    def __str__(self):
        return self.key
    
    @classmethod
    def get_setting(cls, key, default=None):
        """
        الحصول على إعداد
        Get a setting value
        """
        try:
            setting = cls.objects.get(key=key)
            return setting.value
        except cls.DoesNotExist:
            return default
    
    @classmethod
    def set_setting(cls, key, value, description=None):
        """
        تعيين إعداد
        Set a setting value
        """
        return cls.objects.update_or_create(
            key=key,
            defaults={'value': value, 'description': description}
        )


class FiscalYear(models.Model):
    """
    السنة المالية
    Fiscal Year
    """
    
    name = models.CharField(
        _('اسم السنة المالية'),
        max_length=50
    )
    start_date = models.DateField(
        _('تاريخ البداية')
    )
    end_date = models.DateField(
        _('تاريخ النهاية')
    )
    is_active = models.BooleanField(
        _('نشطة'),
        default=False
    )
    is_closed = models.BooleanField(
        _('مغلقة'),
        default=False
    )
    closed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('أغلقت بواسطة'),
        related_name='closed_fiscal_years'
    )
    closed_at = models.DateTimeField(
        _('تاريخ الإغلاق'),
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(
        _('تاريخ الإنشاء'),
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _('تاريخ التحديث'),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _('سنة مالية')
        verbose_name_plural = _('السنوات المالية')
        ordering = ['-start_date']
    
    def __str__(self):
        return self.name
