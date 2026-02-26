# Frontend - نظام إدارة المخزون والمحاسبة

واجهة المستخدم لنظام ERP مبنية باستخدام Next.js 15 و TypeScript و Tailwind CSS.

## 🚀 التقنيات المستخدمة

- **Next.js 15** - App Router
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **React Query** - Data Fetching
- **Zustand** - State Management
- **خط Tajawal** - Arabic Font

## 📦 التثبيت

```bash
# تثبيت المتطلبات
bun install

# تشغيل الخادم
bun run dev
```

## 🔗 متغيرات البيئة

أنشئ ملف `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📁 هيكل المشروع

```
src/
├── app/                    # صفحات التطبيق
│   ├── (auth)/            # صفحات المصادقة
│   │   └── login/         # تسجيل الدخول
│   ├── (dashboard)/       # لوحة التحكم
│   │   ├── dashboard/     # الرئيسية
│   │   ├── users/         # إدارة المستخدمين
│   │   ├── profile/       # الملف الشخصي
│   │   └── settings/      # الإعدادات
│   ├── layout.tsx         # التخطيط الرئيسي
│   ├── page.tsx           # الصفحة الرئيسية
│   └── globals.css        # الأنماط العامة
│
├── components/            # المكونات
│   ├── ui/               # مكونات shadcn/ui
│   └── layout/           # مكونات التخطيط
│
├── context/              # React Context
│   └── AuthContext.tsx   # سياق المصادقة
│
├── hooks/                # Custom Hooks
│
└── lib/                  # المكتبات
    ├── api.ts            # عميل API
    └── utils.ts          # الأدوات
```

## 🌐 الصفحات

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| تسجيل الدخول | `/login` | صفحة المصادقة |
| الرئيسية | `/dashboard` | لوحة التحكم |
| المستخدمين | `/dashboard/users` | إدارة المستخدمين |
| الملف الشخصي | `/dashboard/profile` | عرض وتعديل البيانات |
| الإعدادات | `/dashboard/settings` | إعدادات الشركة |

## 🔐 بيانات الدخول الافتراضية

```
البريد الإلكتروني: admin@admin.com
كلمة المرور: admin123456
```

## 🎨 المميزات

- ✅ دعم كامل للغة العربية (RTL)
- ✅ خط Tajawal الاحترافي
- ✅ تصميم متجاوب (Responsive)
- ✅ وضع داكن/فاتح
- ✅ إشعارات Toast
- ✅ جداول تفاعلية
- ✅ نماذج مع تحقق

## 📝 الأوامر

```bash
# تشغيل الخادم
bun run dev

# بناء للإنتاج
bun run build

# فحص الكود
bun run lint
```

## 🔗 API Endpoints

يتصل الـ Frontend بـ Django Backend على:

- `POST /api/auth/token/` - تسجيل الدخول
- `GET /api/auth/users/` - قائمة المستخدمين
- `POST /api/auth/users/` - إنشاء مستخدم
- `GET /api/auth/users/me/` - المستخدم الحالي
- `GET /api/auth/company/current/` - إعدادات الشركة
