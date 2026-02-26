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
| التقنية | الوصف |
|---------|-------|
| Django 5.0 | إطار العمل الأساسي |
| Django REST Framework | API RESTful |
| djangorestframework-simplejwt | مصادقة JWT |
| SQLite | قاعدة البيانات |

### Frontend (Next.js)
| التقنية | الوصف |
|---------|-------|
| Next.js 15 | إطار العمل الأساسي |
| TypeScript | أمان الأنواع |
| Tailwind CSS | التصميم |
| shadcn/ui | مكونات UI |
| React Query | جلب البيانات |

## 📦 هيكل المشروع

```
store_management_erp/
├── backend/                    # Django Backend
│   ├── accounts/              # إدارة المستخدمين
│   ├── core/                  # النواة والإعدادات
│   ├── config/                # إعدادات Django
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # صفحات التطبيق
│   │   ├── components/        # المكونات
│   │   ├── context/           # React Context
│   │   └── lib/               # المكتبات
│   ├── package.json
│   └── README.md
│
├── docs/                       # التوثيق
└── README.md
```

## 🚀 التثبيت والتشغيل

### 1. Backend (Django)

```bash
cd backend

# إنشاء بيئة افتراضية
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو venv\Scripts\activate  # Windows

# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل الهجرات
python manage.py migrate

# إنشاء المستخدم الافتراضي
python manage.py setup_admin

# تشغيل الخادم
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend (Next.js)

```bash
cd frontend

# تثبيت المتطلبات
bun install

# تشغيل الخادم
bun run dev
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
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| API Docs | http://localhost:8000/api/docs/ |
| Django Admin | http://localhost:8000/admin/ |

## 📡 API Endpoints

### المصادقة
```
POST /api/auth/token/          # تسجيل الدخول
POST /api/auth/logout/         # تسجيل الخروج
GET  /api/auth/users/me/       # المستخدم الحالي
```

### المستخدمين
```
GET    /api/auth/users/        # قائمة المستخدمين
POST   /api/auth/users/        # إنشاء مستخدم
PUT    /api/auth/users/{id}/   # تعديل مستخدم
DELETE /api/auth/users/{id}/   # حذف مستخدم
```

### إعدادات الشركة
```
GET   /api/auth/company/current/   # الإعدادات
PATCH /api/auth/company/current/   # تعديل الإعدادات
```

## 👥 الأدوار والصلاحيات

| الدور | الصلاحيات |
|-------|-----------|
| مدير النظام | صلاحيات كاملة على جميع الوحدات |
| محاسب | الوصول للوحدة المحاسبية |
| مندوب مبيعات | الوصول لوحدة المبيعات |
| مسؤول مخزون | الوصول لوحدة المخزون |
| مستخدم عادي | صلاحيات محدودة |

## 📝 معلومات التطوير

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
```

### Frontend
```bash
# تشغيل الخادم التطويري
bun run dev

# بناء للإنتاج
bun run build

# فحص الكود
bun run lint
```

## 📄 الترخيص

هذا المشروع مخصص للاستخدام التجاري والتعليمي.

---

**تم التطوير بـ ❤️ باستخدام Django + Next.js**
