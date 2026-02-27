"""
إعدادات المسؤول للنواة
Core Admin Configuration
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from mptt.admin import MPTTModelAdmin

from .models import (
    AuditLog, SystemSettings, FiscalYear,
    Account, JournalEntry, JournalEntryLine
)


class JournalEntryLineInline(admin.TabularInline):
    model = JournalEntryLine
    extra = 2
    fields = ['account', 'debit', 'credit', 'description']


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


@admin.register(Account)
class AccountAdmin(MPTTModelAdmin):
    list_display = ['code', 'name', 'account_type', 'is_active', 'is_header', 'current_balance']
    list_filter = ['account_type', 'is_active', 'is_header']
    search_fields = ['code', 'name']
    readonly_fields = ['current_balance', 'created_at', 'updated_at']
    mptt_level_indent = 20


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ['entry_number', 'date', 'fiscal_year', 'status', 'total_debit', 'total_credit', 'created_by']
    list_filter = ['status', 'fiscal_year', 'date']
    search_fields = ['entry_number', 'description', 'reference']
    readonly_fields = [
        'entry_number', 'total_debit', 'total_credit',
        'created_by', 'posted_by', 'posted_at',
        'cancelled_by', 'cancelled_at', 'created_at', 'updated_at'
    ]
    inlines = [JournalEntryLineInline]
    date_hierarchy = 'date'


@admin.register(JournalEntryLine)
class JournalEntryLineAdmin(admin.ModelAdmin):
    list_display = ['journal_entry', 'account', 'debit', 'credit', 'description']
    list_filter = ['account', 'journal_entry__status']
    search_fields = ['journal_entry__entry_number', 'account__code', 'account__name']
