# نظام إدارة المخزون والمحاسبة - Store Management ERP

نظام ERP متكامل لإدارة المخزون والمحاسبة مبني باستخدام Django و Next.js.

## 🚀 المميزات

### المرحلة الأولى (الحالية)
- ✅ نظام المصادقة وإدارة المستخدمين
- ✅ لوحة تحكم احترافية باللغة العربية
- ✅ إدارة المستخدمين (للمسؤولين)
- ✅ الملف الشخصي وتغيير كلمة المرور
- ✅ إعدادات الشركة
- ✅ صلاحيات مستندة للأدوار (RBAC)

### المراحل القادمة
- 🔜 شجرة الحسابات والقيود المحاسبية
- 🔜 إدارة المخزون
- 🔜 المشتريات والموردين
- 🔜 المبيعات والعملاء
- 🔜 التقارير المالية

## 🛠️ التقنيات المستخدمة

### Backend (Django)
| التقنية | الإصدار | الوصف |
|---------|---------|-------|
| Django | 5.0.2 | إطار العمل الأساسي |
| Django REST Framework | 3.14.0 | API RESTful |
| djangorestframework-simplejwt | 5.3.1 | مصادقة JWT |
| SQLite | - | قاعدة البيانات |
| django-cors-headers | 4.3.1 | دعم CORS |

### Frontend (Next.js)
| التقنية | الإصدار | الوصف |
|---------|---------|-------|
| Next.js | 15.x | إطار العمل الأساسي (App Router) |
| TypeScript | 5.x | أمان الأنواع |
| Tailwind CSS | 4.x | التصميم |
| shadcn/ui | Latest | مكونات UI |
| React Query | 5.x | جلب البيانات |
| Zustand | 5.x | إدارة الحالة |

## 📦 هيكل المشروع

```
store_management_erp/
├── backend/                    # Django Backend
│   ├── accounts/              # إدارة المستخدمين
│   │   ├── models.py          # CustomUser, Profile, CompanySettings
│   │   ├── serializers.py     # DRF Serializers
│   │   ├── views.py           # API Views
│   │   ├── permissions.py     # RBAC Permissions
│   │   └── urls.py            # URL Routes
│   │
│   ├── core/                  # النواة والإعدادات
│   │   ├── models.py          # AuditLog, SystemSettings, FiscalYear
│   │   └── ...
│   │
│   ├── config/                # إعدادات Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # صفحات التطبيق
│   │   │   ├── (auth)/login/  # تسجيل الدخول
│   │   │   ├── (dashboard)/   # لوحة التحكم
│   │   │   │   ├── dashboard/ # الرئيسية
│   │   │   │   ├── users/     # المستخدمين
│   │   │   │   ├── profile/   # الملف الشخصي
│   │   │   │   └── settings/  # الإعدادات
│   │   │   └── layout.tsx
│   │   │
│   │   ├── components/        # المكونات
│   │   │   ├── ui/           # shadcn/ui
│   │   │   └── layout/       # التخطيط
│   │   │
│   │   ├── context/          # React Context
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── hooks/            # Custom Hooks
│   │   │
│   │   └── lib/              # المكتبات
│   │       ├── api.ts        # عميل API
│   │       └── utils.ts      # الأدوات
│   │
│   ├── package.json
│   └── README.md
│
├── docs/                       # التوثيق
├── .gitignore
└── README.md
```

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية
- Python 3.10+
- Node.js 18+
- npm 9+

### 1. استنساخ المشروع

```bash
git clone https://github.com/MohammedIsmail36/store_management_erp.git
cd store_management_erp
```

### 2. إعداد Backend (Django)

```bash
cd backend

# إنشاء بيئة افتراضية
python -m venv venv

# تفعيل البيئة الافتراضية
source venv/bin/activate      # Linux/Mac
# أو
venv\Scripts\activate         # Windows

# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل الهجرات
python manage.py migrate

# إنشاء المستخدم الافتراضي والإعدادات
python manage.py setup_admin

# تشغيل الخادم
python manage.py runserver 0.0.0.0:8000
```

### 3. إعداد Frontend (Next.js)

```bash
# في طرفية جديدة
cd frontend

# تثبيت المتطلبات
npm install

# تشغيل الخادم التطويري
npm run dev
```

## 🔐 بيانات الدخول الافتراضية

```
البريد الإلكتروني: admin@admin.com
كلمة المرور: admin123456
```

⚠️ **يرجى تغيير كلمة المرور فوراً بعد أول تسجيل دخول**

## 🌐 الروابط

| الخدمة | الرابط |
|--------|--------|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000/api |
| **API Documentation** | http://localhost:8000/api/docs/ |
| **Django Admin** | http://localhost:8000/admin/ |

## 📡 API Endpoints

### المصادقة
```
POST /api/auth/token/          # تسجيل الدخول
POST /api/auth/token/refresh/  # تحديث الرمز
POST /api/auth/logout/         # تسجيل الخروج
GET  /api/auth/users/me/       # المستخدم الحالي
```

### المستخدمين
```
GET    /api/auth/users/        # قائمة المستخدمين
POST   /api/auth/users/        # إنشاء مستخدم
GET    /api/auth/users/{id}/   # تفاصيل مستخدم
PUT    /api/auth/users/{id}/   # تعديل مستخدم
DELETE /api/auth/users/{id}/   # حذف مستخدم
GET    /api/auth/users/roles/  # قائمة الأدوار
```

### الملف الشخصي
```
GET   /api/auth/profiles/my_profile/    # الملف الشخصي
PATCH /api/auth/profiles/my_profile/    # تعديل الملف
POST  /api/auth/password/change/        # تغيير كلمة المرور
```

### إعدادات الشركة
```
GET   /api/auth/company/current/    # الإعدادات
PATCH /api/auth/company/current/    # تعديل الإعدادات
```

## 👥 الأدوار والصلاحيات

| الدور | Arabic | الصلاحيات |
|-------|--------|-----------|
| Admin | مدير النظام | صلاحيات كاملة على جميع الوحدات |
| Accountant | محاسب | الوصول للوحدة المحاسبية |
| Sales | مندوب مبيعات | الوصول لوحدة المبيعات |
| Inventory Manager | مسؤول مخزون | الوصول لوحدة المخزون |
| User | مستخدم عادي | صلاحيات محدودة |

## 🎨 مميزات الواجهة

- ✅ **دعم كامل للغة العربية** (RTL)
- ✅ **خط Tajawal** الاحترافي
- ✅ **تصميم متجاوب** (Responsive)
- ✅ **وضع داكن/فاتح** (Dark/Light Mode)
- ✅ **إشعارات Toast** احترافية
- ✅ **جداول تفاعلية** مع فرز وتصفية
- ✅ **نماذج مع تحقق** (React Hook Form + Zod)

## 📝 أوامر التطوير

### Backend
```bash
# إنشاء هجرة جديدة
python manage.py makemigrations

# تطبيق الهجرات
python manage.py migrate

# إنشاء مستخدم خارق
python manage.py createsuperuser

# تشغيل الاختبارات
python manage.py test

# فحص الكود
flake8 .
```

### Frontend
```bash
# تشغيل الخادم التطويري
npm run dev

# بناء للإنتاج
npm run build

# تشغيل الإنتاج
npm start

# فحص الكود
npm run lint
```

## 🔧 متغيرات البيئة

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📈 خارطة الطريق

| المرحلة | الوصف | الحالة |
|---------|-------|--------|
| **المرحلة 1** | المصادقة وإدارة المستخدمين | ✅ مكتمل |
| **المرحلة 2** | شجرة الحسابات والقيود | 🔜 قيد التخطيط |
| **المرحلة 3** | إدارة المخزون | 🔜 قيد التخطيط |
| **المرحلة 4** | المشتريات والموردين | 🔜 قيد التخطيط |
| **المرحلة 5** | المبيعات والعملاء | 🔜 قيد التخطيط |
| **المرحلة 6** | التقارير والتحليلات | 🔜 قيد التخطيط |

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المستودع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مخصص للاستخدام التجاري والتعليمي.

---

**تم التطوير بـ ❤️ باستخدام Django + Next.js**
