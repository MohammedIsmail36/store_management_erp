"""
إعدادات المسؤول للنواة
Core Admin Configuration
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import AuditLog, SystemSettings, FiscalYear


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'object_repr', 'timestamp', 'ip_address']
    list_filter = ['action', 'model_name', 'timestamp']
    search_fields = ['user__email', 'object_repr', 'model_name']
    readonly_fields = [
        'user', 'action', 'model_name', 'object_id', 'object_repr',
        'old_data', 'new_data', 'ip_address', 'user_agent', 'timestamp'
    ]
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ['key', 'description', 'updated_at']
    search_fields = ['key', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(FiscalYear)
class FiscalYearAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'is_active', 'is_closed']
    list_filter = ['is_active', 'is_closed']
    readonly_fields = ['closed_by', 'closed_at', 'created_at', 'updated_at']
