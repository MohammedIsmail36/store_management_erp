"""
معروضات النواة
Core Views
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db.models import Sum

from .models import (
    AuditLog, SystemSettings, FiscalYear,
    AccountType, Account, JournalEntry, JournalEntryLine
)
from .serializers import (
    AuditLogSerializer, SystemSettingsSerializer, FiscalYearSerializer,
    AccountTypeSerializer, AccountTreeSerializer, AccountListSerializer,
    AccountCreateUpdateSerializer,
    JournalEntryListSerializer, JournalEntryDetailSerializer,
    JournalEntryCreateSerializer, JournalEntryUpdateSerializer
)
from accounts.permissions import IsAdmin, IsAccountant


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    مجموعة معروضات سجل المراجعة
    Audit Log ViewSet (Read-only)
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['action', 'model_name', 'user']
    search_fields = ['object_repr', 'model_name']
    ordering = ['-timestamp']


class SystemSettingsViewSet(viewsets.ModelViewSet):
    """
    مجموعة معروضات إعدادات النظام
    System Settings ViewSet
    """
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'key'
    
    @action(detail=False, methods=['get'])
    def get_value(self, request, key=None):
        """
        الحصول على قيمة إعداد معين
        Get specific setting value
        """
        key = request.query_params.get('key')
        if not key:
            return Response({
                'success': False,
                'message': 'يجب تحديد المفتاح'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        value = SystemSettings.get_setting(key)
        if value is None:
            return Response({
                'success': False,
                'message': 'الإعداد غير موجود'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': True,
            'data': {'key': key, 'value': value}
        })


class FiscalYearViewSet(viewsets.ModelViewSet):
    """
    مجموعة معروضات السنة المالية
    Fiscal Year ViewSet
    """
    queryset = FiscalYear.objects.all()
    serializer_class = FiscalYearSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'is_closed']
    ordering = ['-start_date']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        تفعيل السنة المالية
        Activate fiscal year
        """
        fiscal_year = self.get_object()
        
        if fiscal_year.is_closed:
            return Response({
                'success': False,
                'message': 'لا يمكن تفعيل سنة مالية مغلقة'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Deactivate other fiscal years
        FiscalYear.objects.filter(is_active=True).update(is_active=False)
        
        fiscal_year.is_active = True
        fiscal_year.save()
        
        return Response({
            'success': True,
            'message': 'تم تفعيل السنة المالية بنجاح',
            'data': self.get_serializer(fiscal_year).data
        })
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """
        إغلاق السنة المالية
        Close fiscal year
        """
        fiscal_year = self.get_object()
        
        if fiscal_year.is_closed:
            return Response({
                'success': False,
                'message': 'السنة المالية مغلقة بالفعل'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        fiscal_year.is_closed = True
        fiscal_year.is_active = False
        fiscal_year.closed_by = request.user
        fiscal_year.save()
        
        return Response({
            'success': True,
            'message': 'تم إغلاق السنة المالية بنجاح',
            'data': self.get_serializer(fiscal_year).data
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        الحصول على السنة المالية النشطة
        Get active fiscal year
        """
        try:
            fiscal_year = FiscalYear.objects.get(is_active=True)
            return Response({
                'success': True,
                'data': self.get_serializer(fiscal_year).data
            })
        except FiscalYear.DoesNotExist:
            return Response({
                'success': False,
                'message': _('لا توجد سنة مالية نشطة')
            }, status=status.HTTP_404_NOT_FOUND)


# ============ شجرة الحسابات ============

class AccountViewSet(viewsets.ModelViewSet):
    """
    مجموعة معروضات شجرة الحسابات
    Chart of Accounts ViewSet
    """
    queryset = Account.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['account_type', 'is_active', 'is_header']
    search_fields = ['code', 'name']
    ordering = ['code']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AccountListSerializer
        elif self.action == 'retrieve':
            return AccountTreeSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return AccountCreateUpdateSerializer
        return AccountTreeSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAccountant()]
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.save()
        return Response({
            'success': True,
            'message': _('تم إنشاء الحساب بنجاح'),
            'data': AccountTreeSerializer(account).data
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'success': True,
            'message': _('تم تحديث الحساب بنجاح'),
            'data': AccountTreeSerializer(instance).data
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if account has children
        if instance.get_children().exists():
            return Response({
                'success': False,
                'message': _('لا يمكن حذف حساب له حسابات فرعية')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if account has journal entries
        if instance.journal_lines.exists():
            return Response({
                'success': False,
                'message': _('لا يمكن حذف حساب له قيود محاسبية')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.delete()
        return Response({
            'success': True,
            'message': _('تم حذف الحساب بنجاح')
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """
        الحصول على شجرة الحسابات الكاملة
        Get full account tree
        """
        root_accounts = Account.objects.filter(parent=None)
        serializer = AccountTreeSerializer(root_accounts, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """
        الحصول على أنواع الحسابات
        Get account types
        """
        types = [{'value': choice[0], 'label': choice[1]} for choice in AccountType.choices]
        return Response({
            'success': True,
            'data': types
        })
    
    @action(detail=True, methods=['post'])
    def recalculate_balance(self, request, pk=None):
        """
        إعادة حساب رصيد الحساب
        Recalculate account balance
        """
        account = self.get_object()
        balance = account.calculate_balance()
        return Response({
            'success': True,
            'message': _('تم إعادة حساب الرصيد'),
            'data': {'current_balance': balance}
        })


# ============ القيود المحاسبية ============

class JournalEntryViewSet(viewsets.ModelViewSet):
    """
    مجموعة معروضات القيود المحاسبية
    Journal Entries ViewSet
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'fiscal_year']
    search_fields = ['entry_number', 'description', 'reference']
    ordering = ['-date', '-entry_number']
    
    def get_queryset(self):
        queryset = JournalEntry.objects.all()
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return JournalEntryListSerializer
        elif self.action == 'retrieve':
            return JournalEntryDetailSerializer
        elif self.action == 'create':
            return JournalEntryCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return JournalEntryUpdateSerializer
        return JournalEntryDetailSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'post_entry', 'cancel_entry']:
            return [IsAccountant()]
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'success': True,
                'data': serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = serializer.save()
        return Response({
            'success': True,
            'message': _('تم إنشاء القيد بنجاح'),
            'data': JournalEntryDetailSerializer(entry).data
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'success': True,
            'message': _('تم تحديث القيد بنجاح'),
            'data': JournalEntryDetailSerializer(instance).data
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if instance.status != JournalEntry.EntryStatus.DRAFT:
            return Response({
                'success': False,
                'message': _('لا يمكن حذف قيد غير مسودة')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.delete()
        return Response({
            'success': True,
            'message': _('تم حذف القيد بنجاح')
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def post_entry(self, request, pk=None):
        """
        ترحيل القيد
        Post journal entry
        """
        entry = self.get_object()
        
        try:
            entry.post(request.user)
            return Response({
                'success': True,
                'message': _('تم ترحيل القيد بنجاح'),
                'data': JournalEntryDetailSerializer(entry).data
            })
        except ValueError as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel_entry(self, request, pk=None):
        """
        إلغاء القيد
        Cancel journal entry
        """
        entry = self.get_object()
        reason = request.data.get('reason', '')
        
        try:
            entry.cancel(request.user, reason)
            return Response({
                'success': True,
                'message': _('تم إلغاء القيد بنجاح'),
                'data': JournalEntryDetailSerializer(entry).data
            })
        except ValueError as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statuses(self, request):
        """
        الحصول على حالات القيود
        Get journal entry statuses
        """
        statuses = [{'value': choice[0], 'label': choice[1]} for choice in JournalEntry.EntryStatus.choices]
        return Response({
            'success': True,
            'data': statuses
        })
