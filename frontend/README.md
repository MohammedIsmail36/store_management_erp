# Frontend - نظام إدارة المخزون والمحاسبة

واجهة المستخدم لنظام ERP مبنية باستخدام Next.js 15 و TypeScript و Tailwind CSS.

## 🚀 التقنيات المستخدمة

| التقنية | الإصدار | الوصف |
|---------|---------|-------|
| Next.js | 15.x | إطار العمل الأساسي (App Router) |
| TypeScript | 5.x | أمان الأنواع |
| Tailwind CSS | 4.x | التصميم |
| shadcn/ui | Latest | مكونات UI |
| React Query | 5.x | جلب البيانات |
| Zustand | 5.x | إدارة الحالة |
| خط Tajawal | - | الخط العربي |

## 📦 التثبيت

```bash
# تثبيت المتطلبات
npm install

# تشغيل الخادم التطويري
npm run dev

# بناء للإنتاج
npm run build

# تشغيل الإنتاج
npm start
```

## 🔗 متغيرات البيئة

أنشئ ملف `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📁 هيكل المشروع

```
src/
├── app/                    # صفحات التطبيق (App Router)
│   ├── (auth)/            # صفحات المصادقة
│   │   ├── layout.tsx
│   │   └── login/         # تسجيل الدخول
│   │       └── page.tsx
│   │
│   ├── (dashboard)/       # لوحة التحكم (محمية)
│   │   ├── layout.tsx
│   │   ├── dashboard/     # الرئيسية
│   │   ├── users/         # إدارة المستخدمين
│   │   ├── profile/       # الملف الشخصي
│   │   └── settings/      # الإعدادات
│   │
│   ├── api/               # API Routes
│   ├── layout.tsx         # التخطيط الرئيسي
│   ├── page.tsx           # الصفحة الرئيسية
│   ├── providers.tsx      # مقدمي الخدمات
│   └── globals.css        # الأنماط العامة
│
├── components/            # المكونات
│   ├── ui/               # مكونات shadcn/ui
│   └── layout/           # مكونات التخطيط
│       ├── Sidebar.tsx   # القائمة الجانبية
│       └── Header.tsx    # الرأسية
│
├── context/              # React Context
│   └── AuthContext.tsx   # سياق المصادقة
│
├── hooks/                # Custom Hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
└── lib/                  # المكتبات والأدوات
    ├── api.ts            # عميل API
    ├── db.ts             # قاعدة البيانات
    └── utils.ts          # الأدوات المساعدة
```

## 🌐 الصفحات

| الصفحة | المسار | الوصف | الصلاحية |
|--------|--------|-------|----------|
| تسجيل الدخول | `/login` | صفحة المصادقة | عامة |
| الرئيسية | `/dashboard` | لوحة التحكم | مصادق |
| المستخدمين | `/dashboard/users` | إدارة المستخدمين | مدير |
| الملف الشخصي | `/dashboard/profile` | عرض وتعديل البيانات | مصادق |
| الإعدادات | `/dashboard/settings` | إعدادات الشركة | مدير |

## 🔐 بيانات الدخول الافتراضية

```
البريد الإلكتروني: admin@admin.com
كلمة المرور: admin123456
```

## 🎨 المميزات

- ✅ **دعم كامل للغة العربية** (RTL)
- ✅ **خط Tajawal** الاحترافي
- ✅ **تصميم متجاوب** (Responsive)
- ✅ **وضع داكن/فاتح** (Dark/Light Mode)
- ✅ **إشعارات Toast** احترافية
- ✅ **جداول تفاعلية** مع فرز وتصفية
- ✅ **نماذج مع تحقق** (React Hook Form + Zod)
- ✅ **إدارة حالة المستخدم** (Auth Context)
- ✅ **تحديث تلقائي للرمز** (Token Refresh)

## 📝 الأوامر

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

## 🔗 API Endpoints

يتصل الـ Frontend بـ Django Backend على:

| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/api/auth/token/` | POST | تسجيل الدخول |
| `/api/auth/token/refresh/` | POST | تحديث الرمز |
| `/api/auth/logout/` | POST | تسجيل الخروج |
| `/api/auth/users/` | GET | قائمة المستخدمين |
| `/api/auth/users/` | POST | إنشاء مستخدم |
| `/api/auth/users/{id}/` | PUT/PATCH | تعديل مستخدم |
| `/api/auth/users/{id}/` | DELETE | حذف مستخدم |
| `/api/auth/users/me/` | GET | المستخدم الحالي |
| `/api/auth/users/roles/` | GET | قائمة الأدوار |
| `/api/auth/profiles/my_profile/` | GET | الملف الشخصي |
| `/api/auth/profiles/my_profile/` | PATCH | تعديل الملف |
| `/api/auth/password/change/` | POST | تغيير كلمة المرور |
| `/api/auth/company/current/` | GET | إعدادات الشركة |
| `/api/auth/company/current/` | PATCH | تعديل الإعدادات |

## 🎯 الصلاحيات

| الدور | المستخدمين | الإعدادات | الملف الشخصي |
|-------|-----------|-----------|--------------|
| مدير النظام | ✅ كامل | ✅ كامل | ✅ |
| محاسب | ❌ | ❌ | ✅ |
| مندوب مبيعات | ❌ | ❌ | ✅ |
| مسؤول مخزون | ❌ | ❌ | ✅ |
| مستخدم عادي | ❌ | ❌ | ✅ |

## 🖥️ المتطلبات

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح Issue في المستودع.

---

**تم التطوير باستخدام Next.js 15 + TypeScript + Tailwind CSS**
