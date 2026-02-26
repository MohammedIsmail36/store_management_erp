"""
عناوين URL للنواة
Core URL patterns
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, SystemSettingsViewSet, FiscalYearViewSet

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'settings', SystemSettingsViewSet, basename='system-settings')
router.register(r'fiscal-years', FiscalYearViewSet, basename='fiscal-year')

urlpatterns = [
    path('', include(router.urls)),
]
