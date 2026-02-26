"""
عناوين URL للمستخدمين والمصادقة
URL patterns for User Management and Authentication
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, ProfileViewSet, CompanySettingsViewSet,
    ChangePasswordView, CustomTokenObtainPairView, logout_view
)

# Router configuration
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'company', CompanySettingsViewSet, basename='company')
router.register(r'password', ChangePasswordView, basename='password')

urlpatterns = [
    # JWT Authentication
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view, name='logout'),
    
    # ViewSet routes
    path('', include(router.urls)),
]
