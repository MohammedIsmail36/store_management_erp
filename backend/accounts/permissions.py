"""
صلاحيات المستخدمين
Custom Permissions for User Management
"""

from rest_framework import permissions
from django.utils.translation import gettext_lazy as _


class IsAdmin(permissions.BasePermission):
    """
    صلاحية المسؤول فقط
    Permission for admin users only
    """
    message = _('يجب أن تكون مسؤولاً للقيام بهذه العملية')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin
    
    def has_object_permission(self, request, view, obj):
        return request.user.is_admin


class IsAccountant(permissions.BasePermission):
    """
    صلاحية المحاسب
    Permission for accountant and above
    """
    message = _('يجب أن تكون محاسباً أو مسؤولاً للقيام بهذه العملية')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_accountant


class IsSales(permissions.BasePermission):
    """
    صلاحية المبيعات
    Permission for sales and above
    """
    message = _('يجب أن تكون مندوب مبيعات أو مسؤولاً للقيام بهذه العملية')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_sales


class IsInventoryManager(permissions.BasePermission):
    """
    صلاحية مسؤول المخزون
    Permission for inventory manager and above
    """
    message = _('يجب أن تكون مسؤول مخزون أو مسؤولاً للقيام بهذه العملية')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_inventory_manager


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    صلاحية المالك أو المسؤول
    Permission for owner or admin
    """
    message = _('يمكنك فقط التعديل على بياناتك الخاصة')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.is_admin:
            return True
        
        # Check if object has user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if object is a user
        if hasattr(obj, 'email'):
            return obj == request.user
        
        return False


class IsOwner(permissions.BasePermission):
    """
    صلاحية المالك فقط
    Permission for owner only
    """
    message = _('يمكنك فقط الوصول إلى بياناتك الخاصة')
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        if hasattr(obj, 'email'):
            return obj == request.user
        
        return False
