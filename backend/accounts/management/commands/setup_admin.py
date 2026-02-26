"""
أمر إنشاء مستخدم المسؤول الافتراضي
Management command to create default admin user
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import Profile, CompanySettings

User = get_user_model()


class Command(BaseCommand):
    help = 'إنشاء مستخدم المسؤول الافتراضي وإعدادات الشركة'
    
    def handle(self, *args, **options):
        # Create default admin user
        email = 'admin@admin.com'
        password = 'admin123456'
        
        if not User.objects.filter(email=email).exists():
            user = User.objects.create_superuser(
                email=email,
                password=password,
                first_name='مدير',
                last_name='النظام',
                role='admin'
            )
            self.stdout.write(
                self.style.SUCCESS(f'✓ تم إنشاء المستخدم: {email}')
            )
            self.stdout.write(
                self.style.WARNING(f'  كلمة المرور: {password}')
            )
            self.stdout.write(
                self.style.WARNING('  ⚠️ يرجى تغيير كلمة المرور فوراً!')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'المستخدم {email} موجود مسبقاً')
            )
        
        # Create company settings
        if not CompanySettings.objects.exists():
            CompanySettings.objects.create(
                name='شركة افتراضية',
                default_currency='SAR',
                invoice_prefix='INV',
                purchase_prefix='PUR'
            )
            self.stdout.write(
                self.style.SUCCESS('✓ تم إنشاء إعدادات الشركة الافتراضية')
            )
        
        self.stdout.write(
            self.style.SUCCESS('\n✅ تم إعداد النظام بنجاح!')
        )
