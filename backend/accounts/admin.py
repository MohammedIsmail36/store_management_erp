"""
إعدادات المسؤول
Admin configuration for User Management
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html

from .models import CustomUser, Profile, CompanySettings


@admin.register(CustomUser)
class UserAdmin(BaseUserAdmin):
    """
    إدارة المستخدمين في لوحة التحكم
    Custom User Admin
    """
    
    model = CustomUser
    
    list_display = [
        'email', 'first_name', 'last_name', 'role', 'is_active',
        'is_staff', 'created_at'
    ]
    list_filter = ['role', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    
    fieldsets = (
        (_('معلومات الحساب'), {
            'fields': ('email', 'password')
        }),
        (_('المعلومات الشخصية'), {
            'fields': ('first_name', 'last_name', 'phone')
        }),
        (_('الصلاحيات'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('التواريخ'), {
            'fields': ('last_login', 'created_at', 'updated_at')
        }),
    )
    
    add_fieldsets = (
        (_('معلومات الحساب'), {
            'classes': ('wide',),
            'fields': (
                'email', 'first_name', 'last_name', 'password', 'password2',
                'role', 'phone', 'is_active', 'is_staff'
            )
        }),
    )
    
    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new user
            obj.set_password(obj.password)
        super().save_model(request, obj, form, change)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """
    إدارة الملفات الشخصية
    Profile Admin
    """
    
    list_display = ['user', 'city', 'country', 'created_at']
    list_filter = ['country', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'city']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('المستخدم'), {
            'fields': ('user',)
        }),
        (_('المعلومات الشخصية'), {
            'fields': ('avatar', 'address', 'city', 'country', 'birth_date')
        }),
        (_('التواريخ'), {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    """
    إدارة إعدادات الشركة
    Company Settings Admin
    """
    
    list_display = ['name', 'phone', 'email', 'default_currency']
    
    fieldsets = (
        (_('معلومات الشركة'), {
            'fields': ('name', 'logo', 'address', 'phone', 'email', 'website')
        }),
        (_('المعلومات القانونية'), {
            'fields': ('tax_number', 'commercial_register')
        }),
        (_('الإعدادات الافتراضية'), {
            'fields': ('default_currency', 'invoice_prefix', 'purchase_prefix')
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow adding if no settings exist
        if CompanySettings.objects.exists():
            return False
        return super().has_add_permission(request)
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deleting company settings
        return False


# Customize admin site
admin.site.site_header = 'نظام إدارة المخزون والمحاسبة'
admin.site.site_title = 'Store Management ERP'
admin.site.index_title = 'لوحة التحكم الرئيسية'
