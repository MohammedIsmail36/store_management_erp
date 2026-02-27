"""
مسلسلات المستخدمين والملفات الشخصية
Serializers for User and Profile Models
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _

from .models import Profile, CompanySettings, UserRole

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    مسلسل المستخدم الأساسي
    Basic User Serializer
    """
    full_name = serializers.ReadOnlyField(source='get_full_name')
    role_display = serializers.ReadOnlyField(source='get_role_display')
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'role_display', 'phone', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    مسلسل إنشاء مستخدم جديد
    Serializer for creating new users (Admin only)
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        label=_('كلمة المرور')
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label=_('تأكيد كلمة المرور')
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password', 'password_confirm',
            'role', 'phone', 'is_active'
        ]
    
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': _('كلمتا المرور غير متطابقتين')
            })
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        # Profile is created by post_save signal in accounts.signals
        return User.objects.create_user(password=password, **validated_data)


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    مسلسل تحديث المستخدم
    Serializer for updating users
    """
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'role', 'phone', 'is_active'
        ]


class ProfileSerializer(serializers.ModelSerializer):
    """
    مسلسل الملف الشخصي
    Profile Serializer
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'avatar', 'address', 'city', 'country',
            'birth_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    مسلسل تحديث الملف الشخصي
    Serializer for updating profile
    """
    
    class Meta:
        model = Profile
        fields = ['avatar', 'address', 'city', 'country', 'birth_date']


class ChangePasswordSerializer(serializers.Serializer):
    """
    مسلسل تغيير كلمة المرور
    Serializer for password change
    """
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label=_('كلمة المرور الحالية')
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        label=_('كلمة المرور الجديدة')
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label=_('تأكيد كلمة المرور الجديدة')
    )
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_('كلمة المرور الحالية غير صحيحة'))
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': _('كلمتا المرور غير متطابقتين')
            })
        return attrs
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class CompanySettingsSerializer(serializers.ModelSerializer):
    """
    مسلسل إعدادات الشركة
    Company Settings Serializer
    """
    
    class Meta:
        model = CompanySettings
        fields = [
            'id', 'name', 'logo', 'address', 'phone', 'email', 'website',
            'tax_number', 'commercial_register', 'default_currency',
            'invoice_prefix', 'purchase_prefix', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LoginSerializer(serializers.Serializer):
    """
    مسلسل تسجيل الدخول
    Login Serializer
    """
    email = serializers.EmailField(
        label=_('البريد الإلكتروني'),
        required=True
    )
    password = serializers.CharField(
        label=_('كلمة المرور'),
        style={'input_type': 'password'},
        required=True,
        trim_whitespace=False
    )


class UserRoleSerializer(serializers.Serializer):
    """
    مسلسل أدوار المستخدمين
    User Roles Serializer (for dropdowns)
    """
    value = serializers.CharField()
    label = serializers.CharField()
