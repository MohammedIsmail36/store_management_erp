"""
نماذج المستخدمين والملفات الشخصية
User and Profile Models for Store Management ERP
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    """أدوار المستخدمين - User Roles"""
    ADMIN = 'admin', _('مدير النظام')
    ACCOUNTANT = 'accountant', _('محاسب')
    SALES = 'sales', _('مندوب مبيعات')
    INVENTORY_MANAGER = 'inventory_manager', _('مسؤول مخزون')
    USER = 'user', _('مستخدم عادي')


class CustomUserManager(BaseUserManager):
    """
    مدير المستخدمين المخصص
    Custom User Manager for email-based authentication
    """
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('يجب إدخال البريد الإلكتروني'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('المستخدم الخارق يجب أن يكون موظفاً'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('المستخدم الخارق يجب أن يكون مستخدماً خارقاً'))
        
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    """
    نموذج المستخدم المخصص
    Custom User Model with email as primary identifier
    """
    
    username = None  # Remove username field
    email = models.EmailField(
        _('البريد الإلكتروني'),
        unique=True,
        help_text=_('البريد الإلكتروني للمستخدم')
    )
    first_name = models.CharField(
        _('الاسم الأول'),
        max_length=50
    )
    last_name = models.CharField(
        _('الاسم الأخير'),
        max_length=50
    )
    role = models.CharField(
        _('الدور'),
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.USER
    )
    phone = models.CharField(
        _('رقم الهاتف'),
        max_length=20,
        blank=True,
        null=True
    )
    is_active = models.BooleanField(
        _('نشط'),
        default=True,
        help_text=_('هل المستخدم نشط؟')
    )
    created_at = models.DateTimeField(
        _('تاريخ الإنشاء'),
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _('تاريخ التحديث'),
        auto_now=True
    )
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        verbose_name = _('مستخدم')
        verbose_name_plural = _('المستخدمين')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    get_full_name.short_description = _('الاسم الكامل')
    
    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN or self.is_superuser
    
    @property
    def is_accountant(self):
        return self.role == UserRole.ACCOUNTANT or self.is_admin
    
    @property
    def is_sales(self):
        return self.role == UserRole.SALES or self.is_admin
    
    @property
    def is_inventory_manager(self):
        return self.role == UserRole.INVENTORY_MANAGER or self.is_admin


class Profile(models.Model):
    """
    الملف الشخصي للمستخدم
    User Profile with additional information
    """
    
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('المستخدم')
    )
    avatar = models.ImageField(
        _('الصورة الشخصية'),
        upload_to='avatars/',
        blank=True,
        null=True
    )
    address = models.TextField(
        _('العنوان'),
        blank=True,
        null=True
    )
    city = models.CharField(
        _('المدينة'),
        max_length=100,
        blank=True,
        null=True
    )
    country = models.CharField(
        _('الدولة'),
        max_length=100,
        blank=True,
        null=True,
        default='السعودية'
    )
    birth_date = models.DateField(
        _('تاريخ الميلاد'),
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
        verbose_name = _('ملف شخصي')
        verbose_name_plural = _('الملفات الشخصية')
    
    def __str__(self):
        return f"ملف {self.user.get_full_name()}"


class CompanySettings(models.Model):
    """
    إعدادات الشركة
    Company Settings Model (Singleton)
    """
    
    name = models.CharField(
        _('اسم الشركة'),
        max_length=255,
        default='شركة افتراضية'
    )
    logo = models.ImageField(
        _('شعار الشركة'),
        upload_to='company/',
        blank=True,
        null=True
    )
    address = models.TextField(
        _('عنوان الشركة'),
        blank=True,
        null=True
    )
    phone = models.CharField(
        _('رقم الهاتف'),
        max_length=20,
        blank=True,
        null=True
    )
    email = models.EmailField(
        _('البريد الإلكتروني'),
        blank=True,
        null=True
    )
    website = models.URLField(
        _('الموقع الإلكتروني'),
        blank=True,
        null=True
    )
    tax_number = models.CharField(
        _('الرقم الضريبي'),
        max_length=50,
        blank=True,
        null=True
    )
    commercial_register = models.CharField(
        _('السجل التجاري'),
        max_length=50,
        blank=True,
        null=True
    )
    default_currency = models.CharField(
        _('العملة الافتراضية'),
        max_length=3,
        default='SAR'
    )
    invoice_prefix = models.CharField(
        _('بادئة الفاتورة'),
        max_length=10,
        default='INV'
    )
    purchase_prefix = models.CharField(
        _('بادئة فاتورة الشراء'),
        max_length=10,
        default='PUR'
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
        verbose_name = _('إعدادات الشركة')
        verbose_name_plural = _('إعدادات الشركة')
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists (Singleton pattern)
        if CompanySettings.objects.exists() and not self.pk:
            raise ValueError(_('يمكن أن يكون هناك إعدادات شركة واحدة فقط'))
        return super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create company settings"""
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings
