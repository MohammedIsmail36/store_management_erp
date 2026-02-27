"""
نماذج النواة
Core Models for System Settings and Audit
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from mptt.models import MPTTModel, TreeForeignKey
import json

User = get_user_model()


class AccountType(models.TextChoices):
    """أنواع الحسابات المحاسبية - Account Types"""
    ASSET = 'asset', _('أصول')
    LIABILITY = 'liability', _('خصوم')
    EQUITY = 'equity', _('حقوق الملكية')
    REVENUE = 'revenue', _('إيرادات')
    EXPENSE = 'expense', _('مصروفات')


class Account(MPTTModel):
    """
    شجرة الحسابات
    Chart of Accounts - Hierarchical account structure
    """
    
    code = models.CharField(
        _('رقم الحساب'),
        max_length=20,
        unique=True,
        help_text=_('رقم الحساب الفريد (مثال: 1، 1.1، 1.1.1)')
    )
    name = models.CharField(
        _('اسم الحساب'),
        max_length=255
    )
    account_type = models.CharField(
        _('نوع الحساب'),
        max_length=20,
        choices=AccountType.choices,
        help_text=_('تصنيف الحساب المحاسبي')
    )
    parent = TreeForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('الحساب الأب')
    )
    is_active = models.BooleanField(
        _('نشط'),
        default=True
    )
    is_header = models.BooleanField(
        _('حساب رئيسي'),
        default=False,
        help_text=_('الحسابات الرئيسية لا يمكن استخدامها في القيود')
    )
    allow_manual_entry = models.BooleanField(
        _('يسمح بالقيود اليدوية'),
        default=True,
        help_text=_('هل يمكن إدخال قيود يدوية على هذا الحساب')
    )
    opening_balance = models.DecimalField(
        _('الرصيد الافتتاحي'),
        max_digits=18,
        decimal_places=2,
        default=0
    )
    current_balance = models.DecimalField(
        _('الرصيد الحالي'),
        max_digits=18,
        decimal_places=2,
        default=0,
        help_text=_('يتم تحديثه تلقائياً من القيود')
    )
    notes = models.TextField(
        _('ملاحظات'),
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
    
    class MPTTMeta:
        order_insertion_by = ['code']
    
    class Meta:
        verbose_name = _('حساب')
        verbose_name_plural = _('شجرة الحسابات')
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def full_code(self):
        """Get full code including parent codes"""
        codes = [self.code]
        parent = self.parent
        while parent:
            codes.insert(0, parent.code)
            parent = parent.parent
        return '.'.join(codes)
    
    @property
    def balance_side(self):
        """
        تحديد جانب الرصيد الطبيعي
        Returns 'debit' or 'credit'
        """
        debit_types = [AccountType.ASSET, AccountType.EXPENSE]
        return 'debit' if self.account_type in debit_types else 'credit'
    
    def calculate_balance(self):
        """
        حساب الرصيد من القيود
        Calculate balance from journal entries
        """
        from django.db.models import Sum
        
        debit = self.debit_lines.aggregate(Sum('amount'))['amount__sum'] or 0
        credit = self.credit_lines.aggregate(Sum('amount'))['amount__sum'] or 0
        
        if self.balance_side == 'debit':
            self.current_balance = self.opening_balance + debit - credit
        else:
            self.current_balance = self.opening_balance + credit - debit
        
        self.save(update_fields=['current_balance'])
        return self.current_balance


class JournalEntry(models.Model):
    """
    القيد المحاسبي
    Journal Entry
    """
    
    class EntryStatus(models.TextChoices):
        DRAFT = 'draft', _('مسودة')
        POSTED = 'posted', _('مرحل')
        CANCELLED = 'cancelled', _('ملغي')
    
    entry_number = models.CharField(
        _('رقم القيد'),
        max_length=50,
        unique=True,
        help_text=_('رقم القيد التسلسلي')
    )
    date = models.DateField(
        _('التاريخ')
    )
    fiscal_year = models.ForeignKey(
        'FiscalYear',
        on_delete=models.PROTECT,
        related_name='journal_entries',
        verbose_name=_('السنة المالية')
    )
    description = models.TextField(
        _('الوصف'),
        help_text=_('وصف القيد أو سببه')
    )
    reference = models.CharField(
        _('المرجع'),
        max_length=100,
        blank=True,
        null=True,
        help_text=_('رقم المرجع (فاتورة، أمر شراء، إلخ)')
    )
    status = models.CharField(
        _('الحالة'),
        max_length=20,
        choices=EntryStatus.choices,
        default=EntryStatus.DRAFT
    )
    total_debit = models.DecimalField(
        _('إجمالي المدين'),
        max_digits=18,
        decimal_places=2,
        default=0
    )
    total_credit = models.DecimalField(
        _('إجمالي الدائن'),
        max_digits=18,
        decimal_places=2,
        default=0
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='journal_entries_created',
        verbose_name=_('أنشئ بواسطة')
    )
    posted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='journal_entries_posted',
        verbose_name=_('رحل بواسطة')
    )
    posted_at = models.DateTimeField(
        _('تاريخ الترحيل'),
        blank=True,
        null=True
    )
    cancelled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='journal_entries_cancelled',
        verbose_name=_('ألغي بواسطة')
    )
    cancelled_at = models.DateTimeField(
        _('تاريخ الإلغاء'),
        blank=True,
        null=True
    )
    cancellation_reason = models.TextField(
        _('سبب الإلغاء'),
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
        verbose_name = _('قيد محاسبي')
        verbose_name_plural = _('القيود المحاسبية')
        ordering = ['-date', '-entry_number']
    
    def __str__(self):
        return f"{self.entry_number} - {self.date}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.total_debit != self.total_credit:
            raise ValidationError(_('إجمالي المدين يجب أن يساوي إجمالي الدائن'))
    
    def post(self, user):
        """ترحيل القيد"""
        if self.status != self.EntryStatus.DRAFT:
            raise ValueError(_('لا يمكن ترحيل قيد غير مسودة'))
        
        from django.utils import timezone
        self.status = self.EntryStatus.POSTED
        self.posted_by = user
        self.posted_at = timezone.now()
        self.save()
        
        # Update account balances
        for line in self.lines.all():
            line.account.calculate_balance()
    
    def cancel(self, user, reason=''):
        """إلغاء القيد"""
        if self.status != self.EntryStatus.POSTED:
            raise ValueError(_('لا يمكن إلغاء قيد غير مرحل'))
        
        from django.utils import timezone
        self.status = self.EntryStatus.CANCELLED
        self.cancelled_by = user
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason
        self.save()
        
        # Reverse account balances
        for line in self.lines.all():
            line.account.calculate_balance()
    
    @classmethod
    def generate_entry_number(cls, fiscal_year):
        """توليد رقم قيد جديد"""
        prefix = f"JE-{fiscal_year.name}"
        last_entry = cls.objects.filter(
            entry_number__startswith=prefix
        ).order_by('-entry_number').first()
        
        if last_entry:
            try:
                last_num = int(last_entry.entry_number.split('-')[-1])
                new_num = last_num + 1
            except (ValueError, IndexError):
                new_num = 1
        else:
            new_num = 1
        
        return f"{prefix}-{new_num:06d}"


class JournalEntryLine(models.Model):
    """
    بند القيد المحاسبي
    Journal Entry Line
    """
    
    journal_entry = models.ForeignKey(
        JournalEntry,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('القيد')
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name='journal_lines',
        verbose_name=_('الحساب'),
        limit_choices_to={'is_header': False, 'is_active': True}
    )
    debit = models.DecimalField(
        _('مدين'),
        max_digits=18,
        decimal_places=2,
        default=0
    )
    credit = models.DecimalField(
        _('دائن'),
        max_digits=18,
        decimal_places=2,
        default=0
    )
    description = models.CharField(
        _('الوصف'),
        max_length=255,
        blank=True,
        null=True
    )
    cost_center = models.CharField(
        _('مركز التكلفة'),
        max_length=50,
        blank=True,
        null=True
    )
    
    class Meta:
        verbose_name = _('بند قيد')
        verbose_name_plural = _('بنود القيود')
        ordering = ['id']
    
    def __str__(self):
        return f"{self.account.code} - مدين: {self.debit} / دائن: {self.credit}"
    
    @property
    def amount(self):
        """Return the amount (either debit or credit)"""
        return self.debit or self.credit


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
