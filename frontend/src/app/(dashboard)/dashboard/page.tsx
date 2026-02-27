import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">
          المرحلة الأولى: مصادقة، إدارة المستخدمين، الملف الشخصي، وإعدادات الشركة.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>إدارة المستخدمين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              إضافة المستخدمين وتعديل الأدوار والحالات من صفحة واحدة.
            </p>
            <Link href="/dashboard/users">
              <Button>فتح صفحة المستخدمين</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إعدادات الشركة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              تعديل بيانات الشركة والعملة وبوادئ الفواتير والمشتريات.
            </p>
            <Link href="/dashboard/settings">
              <Button variant="secondary">فتح الإعدادات</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
