"""
مسلسلات النواة
Core Serializers
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from .models import AuditLog, SystemSettings, FiscalYear


class AuditLogSerializer(serializers.ModelSerializer):
    """
    مسلسل سجل المراجعة
    Audit Log Serializer
    """
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    action_display = serializers.ReadOnlyField(source='get_action_display')
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_name', 'action', 'action_display',
            'model_name', 'object_id', 'object_repr',
            'old_data', 'new_data', 'ip_address', 'user_agent',
            'timestamp'
        ]
        read_only_fields = fields


class SystemSettingsSerializer(serializers.ModelSerializer):
    """
    مسلسل إعدادات النظام
    System Settings Serializer
    """
    
    class Meta:
        model = SystemSettings
        fields = ['id', 'key', 'value', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class FiscalYearSerializer(serializers.ModelSerializer):
    """
    مسلسل السنة المالية
    Fiscal Year Serializer
    """
    closed_by_name = serializers.ReadOnlyField(source='closed_by.get_full_name')
    
    class Meta:
        model = FiscalYear
        fields = [
            'id', 'name', 'start_date', 'end_date',
            'is_active', 'is_closed', 'closed_by', 'closed_by_name',
            'closed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'closed_by', 'closed_at', 'created_at', 'updated_at']
