"""
مسلسلات النواة
Core Serializers
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.db import transaction

from .models import (
    AuditLog, SystemSettings, FiscalYear,
    AccountType, Account, JournalEntry, JournalEntryLine
)


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


# ============ شجرة الحسابات ============

class AccountTypeSerializer(serializers.Serializer):
    """مسلسل أنواع الحسابات"""
    value = serializers.CharField()
    label = serializers.CharField()


class AccountTreeSerializer(serializers.ModelSerializer):
    """
    مسلسل شجرة الحسابات (للعرض الهرمي)
    Account Tree Serializer
    """
    account_type_display = serializers.ReadOnlyField(source='get_account_type_display')
    balance_side_display = serializers.ReadOnlyField(source='balance_side')
    children_count = serializers.SerializerMethodField()
    parent_name = serializers.ReadOnlyField(source='parent.name')
    
    class Meta:
        model = Account
        fields = [
            'id', 'code', 'name', 'account_type', 'account_type_display',
            'parent', 'parent_name', 'is_active', 'is_header',
            'allow_manual_entry', 'opening_balance', 'current_balance',
            'balance_side_display', 'children_count', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_balance', 'created_at', 'updated_at']
    
    def get_children_count(self, obj):
        return obj.get_children().count()


class AccountListSerializer(serializers.ModelSerializer):
    """
    مسلسل قائمة الحسابات (مسطح)
    Account List Serializer (flat)
    """
    account_type_display = serializers.ReadOnlyField(source='get_account_type_display')
    parent_name = serializers.ReadOnlyField(source='parent.name')
    level = serializers.SerializerMethodField()
    
    class Meta:
        model = Account
        fields = [
            'id', 'code', 'name', 'account_type', 'account_type_display',
            'parent', 'parent_name', 'level', 'is_active', 'is_header',
            'current_balance', 'created_at'
        ]
    
    def get_level(self, obj):
        return obj.level


class AccountCreateUpdateSerializer(serializers.ModelSerializer):
    """
    مسلسل إنشاء/تحديث الحساب
    Account Create/Update Serializer
    """
    
    class Meta:
        model = Account
        fields = [
            'code', 'name', 'account_type', 'parent',
            'is_active', 'is_header', 'allow_manual_entry',
            'opening_balance', 'notes'
        ]
    
    def validate_code(self, value):
        # Check for duplicate code
        instance = self.instance
        qs = Account.objects.filter(code=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(_('رقم الحساب موجود مسبقاً'))
        return value
    
    def validate_parent(self, value):
        # Prevent setting self as parent
        instance = self.instance
        if instance and value and instance.pk == value.pk:
            raise serializers.ValidationError(_('لا يمكن جعل الحساب أب لنفسه'))
        return value


# ============ القيود المحاسبية ============

class JournalEntryLineSerializer(serializers.ModelSerializer):
    """
    مسلسل بند القيد
    Journal Entry Line Serializer
    """
    account_code = serializers.ReadOnlyField(source='account.code')
    account_name = serializers.ReadOnlyField(source='account.name')
    
    class Meta:
        model = JournalEntryLine
        fields = [
            'id', 'account', 'account_code', 'account_name',
            'debit', 'credit', 'description', 'cost_center'
        ]
        read_only_fields = ['id']


class JournalEntryListSerializer(serializers.ModelSerializer):
    """
    مسلسل قائمة القيود
    Journal Entry List Serializer
    """
    status_display = serializers.ReadOnlyField(source='get_status_display')
    fiscal_year_name = serializers.ReadOnlyField(source='fiscal_year.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    lines_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'entry_number', 'date', 'fiscal_year', 'fiscal_year_name',
            'description', 'reference', 'status', 'status_display',
            'total_debit', 'total_credit', 'lines_count',
            'created_by', 'created_by_name', 'created_at'
        ]
    
    def get_lines_count(self, obj):
        return obj.lines.count()


class JournalEntryDetailSerializer(serializers.ModelSerializer):
    """
    مسلسل تفاصيل القيد
    Journal Entry Detail Serializer
    """
    status_display = serializers.ReadOnlyField(source='get_status_display')
    fiscal_year_name = serializers.ReadOnlyField(source='fiscal_year.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    posted_by_name = serializers.ReadOnlyField(source='posted_by.get_full_name')
    cancelled_by_name = serializers.ReadOnlyField(source='cancelled_by.get_full_name')
    lines = JournalEntryLineSerializer(many=True, read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'entry_number', 'date', 'fiscal_year', 'fiscal_year_name',
            'description', 'reference', 'status', 'status_display',
            'total_debit', 'total_credit', 'lines',
            'created_by', 'created_by_name', 'created_at',
            'posted_by', 'posted_by_name', 'posted_at',
            'cancelled_by', 'cancelled_by_name', 'cancelled_at', 'cancellation_reason',
            'updated_at'
        ]
        read_only_fields = [
            'id', 'entry_number', 'total_debit', 'total_credit',
            'created_by', 'posted_by', 'posted_at',
            'cancelled_by', 'cancelled_at', 'created_at', 'updated_at'
        ]


class JournalEntryCreateSerializer(serializers.ModelSerializer):
    """
    مسلسل إنشاء القيد
    Journal Entry Create Serializer
    """
    lines = JournalEntryLineSerializer(many=True)
    
    class Meta:
        model = JournalEntry
        fields = ['date', 'fiscal_year', 'description', 'reference', 'lines']
    
    def validate_lines(self, value):
        if not value or len(value) < 2:
            raise serializers.ValidationError(_('القيد يجب أن يحتوي على بندان على الأقل'))
        
        total_debit = sum(line.get('debit', 0) or 0 for line in value)
        total_credit = sum(line.get('credit', 0) or 0 for line in value)
        
        if total_debit != total_credit:
            raise serializers.ValidationError(
                _('إجمالي المدين ({}) لا يساوي إجمالي الدائن ({})').format(total_debit, total_credit)
            )
        
        if total_debit == 0:
            raise serializers.ValidationError(_('القيد لا يمكن أن يكون صفرياً'))
        
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        request = self.context.get('request')
        
        # Generate entry number
        fiscal_year = validated_data['fiscal_year']
        entry_number = JournalEntry.generate_entry_number(fiscal_year)
        
        # Calculate totals
        total_debit = sum(line.get('debit', 0) or 0 for line in lines_data)
        total_credit = sum(line.get('credit', 0) or 0 for line in lines_data)
        
        # Create entry
        entry = JournalEntry.objects.create(
            entry_number=entry_number,
            total_debit=total_debit,
            total_credit=total_credit,
            created_by=request.user if request else None,
            **validated_data
        )
        
        # Create lines
        for line_data in lines_data:
            JournalEntryLine.objects.create(journal_entry=entry, **line_data)
        
        return entry


class JournalEntryUpdateSerializer(serializers.ModelSerializer):
    """
    مسلسل تحديث القيد (للمسودات فقط)
    Journal Entry Update Serializer (drafts only)
    """
    lines = JournalEntryLineSerializer(many=True)
    
    class Meta:
        model = JournalEntry
        fields = ['date', 'fiscal_year', 'description', 'reference', 'lines']
    
    def validate(self, attrs):
        if self.instance and self.instance.status != JournalEntry.EntryStatus.DRAFT:
            raise serializers.ValidationError(_('لا يمكن تعديل قيد غير مسودة'))
        return attrs
    
    def validate_lines(self, value):
        if not value or len(value) < 2:
            raise serializers.ValidationError(_('القيد يجب أن يحتوي على بندان على الأقل'))
        
        total_debit = sum(line.get('debit', 0) or 0 for line in value)
        total_credit = sum(line.get('credit', 0) or 0 for line in value)
        
        if total_debit != total_credit:
            raise serializers.ValidationError(
                _('إجمالي المدين ({}) لا يساوي إجمالي الدائن ({})').format(total_debit, total_credit)
            )
        
        if total_debit == 0:
            raise serializers.ValidationError(_('القيد لا يمكن أن يكون صفرياً'))
        
        return value
    
    @transaction.atomic
    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        
        # Update entry fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update lines if provided
        if lines_data is not None:
            # Delete old lines
            instance.lines.all().delete()
            
            # Create new lines
            for line_data in lines_data:
                JournalEntryLine.objects.create(journal_entry=instance, **line_data)
            
            # Recalculate totals
            instance.total_debit = sum(line.get('debit', 0) or 0 for line in lines_data)
            instance.total_credit = sum(line.get('credit', 0) or 0 for line in lines_data)
        
        instance.save()
        return instance
