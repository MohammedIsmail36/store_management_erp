"""
معروضات النواة
Core Views
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import AuditLog, SystemSettings, FiscalYear
from .serializers import AuditLogSerializer, SystemSettingsSerializer, FiscalYearSerializer
from accounts.permissions import IsAdmin


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
