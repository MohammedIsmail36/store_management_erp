"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: "المستخدمين",
      value: "0",
      description: "إجمالي المستخدمين",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "المنتجات",
      value: "0",
      description: "إجمالي المنتجات",
      icon: Package,
      color: "bg-green-500",
    },
    {
      title: "المبيعات",
      value: "0 ر.س",
      description: "إجمالي المبيعات",
      icon: ShoppingCart,
      color: "bg-purple-500",
    },
    {
      title: "المشتريات",
      value: "0 ر.س",
      description: "إجمالي المشتريات",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            مرحباً، {user?.full_name || "المستخدم"}
          </h1>
          <p className="text-muted-foreground mt-1">
            لوحة التحكم الرئيسية - نظام إدارة المخزون والمحاسبة
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="font-medium">العملة: ر.س</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">الإجراءات السريعة</CardTitle>
            <CardDescription>
              الوصول السريع إلى المهام الشائعة
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <QuickActionButton
              title="إضافة مستخدم"
              description="إنشاء مستخدم جديد"
              href="/dashboard/users"
              icon={Users}
            />
            <QuickActionButton
              title="المنتجات"
              description="إدارة المنتجات"
              href="/dashboard"
              icon={Package}
              disabled
            />
            <QuickActionButton
              title="فاتورة بيع"
              description="إنشاء فاتورة جديدة"
              href="/dashboard"
              icon={ShoppingCart}
              disabled
            />
            <QuickActionButton
              title="التقارير"
              description="عرض التقارير"
              href="/dashboard"
              icon={TrendingUp}
              disabled
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">التنبيهات</CardTitle>
            <CardDescription>آخر التنبيهات والإشعارات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد تنبيهات حالياً</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="border-0 shadow-md bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">تنبيه:</span>{" "}
              المرحلة الأولى من النظام مفعلة حالياً. ستتم إضافة المزيد من
              الوحدات تدريجياً.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActionButton({
  title,
  description,
  href,
  icon: Icon,
  disabled = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}) {
  const baseClasses =
    "flex items-center gap-3 p-4 rounded-lg border transition-all";

  if (disabled) {
    return (
      <div
        className={`${baseClasses} bg-muted/50 border-muted cursor-not-allowed opacity-50`}
      >
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      className={`${baseClasses} bg-background border-border hover:border-primary hover:bg-primary/5`}
    >
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}
