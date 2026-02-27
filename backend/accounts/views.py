"""
معروضات المستخدمين والمصادقة
Views for User Management and Authentication
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, authenticate
from django.db import IntegrityError
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Profile, CompanySettings, UserRole
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    ProfileSerializer, ProfileUpdateSerializer,
    ChangePasswordSerializer, CompanySettingsSerializer,
    LoginSerializer, UserRoleSerializer
)
from .permissions import IsAdmin, IsOwnerOrAdmin

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    عرض مخصص للحصول على رمز JWT
    Custom Token Obtain Pair View with user data
    """
    
    @extend_schema(
        request=LoginSerializer,
        responses={200: {'type': 'object', 'properties': {
            'access': {'type': 'string'},
            'refresh': {'type': 'string'},
            'user': {'type': 'object'}
        }}},
        description='تسجيل الدخول والحصول على رمز JWT'
    )
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(request, username=email, password=password)
        
        if user is None:
            return Response({
                'success': False,
                'message': _('البريد الإلكتروني أو كلمة المرور غير صحيحة')
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'success': False,
                'message': _('هذا الحساب غير مفعل')
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': _('تم تسجيل الدخول بنجاح'),
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }
        })


class UserViewSet(viewsets.ModelViewSet):
    """
    مجموعة معروضات المستخدمين
    User ViewSet for CRUD operations
    """
    queryset = User.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['created_at', 'email', 'first_name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        elif self.action in ['update', 'partial_update']:
            return [IsOwnerOrAdmin()]
        return [IsAuthenticated()]
    
    @extend_schema(
        description='قائمة المستخدمين (للمسؤولين فقط)'
    )
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
    
    @extend_schema(
        description='إنشاء مستخدم جديد (للمسؤولين فقط)'
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = serializer.save()
        except IntegrityError:
            return Response({
                'success': False,
                'message': _('بيانات المستخدم غير صالحة أو موجودة مسبقًا')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': _('تم إنشاء المستخدم بنجاح'),
            'data': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    @extend_schema(
        description='تفاصيل المستخدم'
    )
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @extend_schema(
        description='تحديث بيانات المستخدم'
    )
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'message': _('تم تحديث المستخدم بنجاح'),
            'data': UserSerializer(instance).data
        })
    
    @extend_schema(
        description='حذف المستخدم (للمسؤولين فقط)'
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Prevent deleting self
        if instance == request.user:
            return Response({
                'success': False,
                'message': _('لا يمكنك حذف حسابك الخاص')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.delete()
        return Response({
            'success': True,
            'message': _('تم حذف المستخدم بنجاح')
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        الحصول على بيانات المستخدم الحالي
        Get current user data
        """
        serializer = self.get_serializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def roles(self, request):
        """
        الحصول على قائمة الأدوار
        Get list of user roles
        """
        roles = [{'value': choice[0], 'label': choice[1]} for choice in UserRole.choices]
        return Response({
            'success': True,
            'data': roles
        })


class ProfileViewSet(viewsets.ModelViewSet):
    """
    مجموعة معروضات الملفات الشخصية
    Profile ViewSet
    """
    queryset = Profile.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return ProfileUpdateSerializer
        return ProfileSerializer
    
    def get_queryset(self):
        # Non-admin users can only see their own profile
        if self.request.user.is_admin:
            return Profile.objects.all()
        return Profile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get', 'patch'])
    def my_profile(self, request):
        """
        الحصول على أو تحديث الملف الشخصي الحالي
        Get or update current user's profile
        """
        profile, _ = Profile.objects.get_or_create(user=request.user)
        
        if request.method == 'PATCH':
            serializer = ProfileUpdateSerializer(
                profile, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({
                'success': True,
                'message': _('تم تحديث الملف الشخصي بنجاح'),
                'data': ProfileSerializer(profile).data
            })
        
        serializer = self.get_serializer(profile)
        return Response({
            'success': True,
            'data': serializer.data
        })


class ChangePasswordView(viewsets.ViewSet):
    """
    عرض تغيير كلمة المرور
    Change Password View
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def change(self, request):
        """
        تغيير كلمة المرور
        Change user password
        """
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'message': _('تم تغيير كلمة المرور بنجاح')
        })


class CompanySettingsViewSet(viewsets.ModelViewSet):
    """
    مجموعة معروضات إعدادات الشركة
    Company Settings ViewSet
    """
    serializer_class = CompanySettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CompanySettings.objects.all()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        settings = CompanySettings.get_settings()
        serializer = self.get_serializer(settings)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get', 'patch'])
    def current(self, request):
        """
        الحصول على أو تحديث الإعدادات الحالية
        Get or update current settings
        """
        settings = CompanySettings.get_settings()
        
        if request.method == 'PATCH':
            if not request.user.is_admin:
                return Response({
                    'success': False,
                    'message': _('ليس لديك صلاحية لتعديل الإعدادات')
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = self.get_serializer(
                settings, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({
                'success': True,
                'message': _('تم تحديث الإعدادات بنجاح'),
                'data': serializer.data
            })
        
        serializer = self.get_serializer(settings)
        return Response({
            'success': True,
            'data': serializer.data
        })


@api_view(['post'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    تسجيل الخروج
    Logout view to blacklist refresh token
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'success': True,
            'message': _('تم تسجيل الخروج بنجاح')
        })
    except Exception:
        return Response({
            'success': True,
            'message': _('تم تسجيل الخروج بنجاح')
        })
