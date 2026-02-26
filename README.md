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

### Backend
- Django 5.0
- Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- SQLite (قابل للتغيير إلى PostgreSQL)

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query

## 📦 التثبيت

### Backend

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
python manage.py runserver
```

### Frontend

```bash
# تثبيت المتطلبات
bun install

# تشغيل الخادم
bun run dev
```

## 🔐 بيانات الدخول الافتراضية

- **البريد الإلكتروني:** admin@admin.com
- **كلمة المرور:** admin123456

⚠️ **يرجى تغيير كلمة المرور فوراً بعد أول تسجيل دخول**

## 📁 هيكل المشروع

```
store_management_erp/
├── backend/                 # Django Backend
│   ├── accounts/           # إدارة المستخدمين
│   ├── core/               # النواة والإعدادات
│   ├── config/             # إعدادات Django
│   └── manage.py
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # الصفحات
│   │   ├── components/    # المكونات
│   │   ├── context/       # React Context
│   │   └── lib/           # المكتبات
│   └── package.json
│
└── docs/                   # التوثيق
```

## 🌐 API Endpoints

### المصادقة
- `POST /api/auth/token/` - تسجيل الدخول
- `POST /api/auth/logout/` - تسجيل الخروج
- `GET /api/auth/users/me/` - المستخدم الحالي

### المستخدمين
- `GET /api/auth/users/` - قائمة المستخدمين
- `POST /api/auth/users/` - إنشاء مستخدم
- `PUT /api/auth/users/{id}/` - تعديل مستخدم
- `DELETE /api/auth/users/{id}/` - حذف مستخدم

### الملف الشخصي
- `GET /api/auth/profiles/my_profile/` - الملف الشخصي
- `PATCH /api/auth/profiles/my_profile/` - تعديل الملف

### إعدادات الشركة
- `GET /api/auth/company/current/` - الإعدادات
- `PATCH /api/auth/company/current/` - تعديل الإعدادات

## 👥 الأدوار

| الدور | الوصف |
|-------|-------|
| مدير النظام | صلاحيات كاملة |
| محاسب | الوصول للوحدة المحاسبية |
| مندوب مبيعات | الوصول لوحدة المبيعات |
| مسؤول مخزون | الوصول لوحدة المخزون |
| مستخدم عادي | صلاحيات محدودة |

## 📝 الترخيص

هذا المشروع مخصص للاستخدام التجاري والتعليمي.

## 🤝 المساهمة

نرحب بأي مساهمات لتحسين المشروع. يرجى فتح Issue أو Pull Request.

---

**تم التطوير بـ ❤️ باستخدام Django + Next.js**
