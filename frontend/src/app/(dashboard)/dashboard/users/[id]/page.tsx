"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { User } from "@/types/auth";

type Role = { value: string; label: string };

function extractRoles(payload: unknown): Role[] {
  if (!payload || !Array.isArray(payload)) return [];
  if (payload.length === 0) return [];

  if (typeof payload[0] === "string") {
    return (payload as string[]).map((role) => ({ value: role, label: role }));
  }

  return (payload as Role[]).map((role) => ({ value: role.value, label: role.label }));
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    role: "user",
    is_active: true,
  });

  useEffect(() => {
    if (!isAdmin || !Number.isFinite(userId)) return;

    const load = async () => {
      setLoading(true);

      const [rolesRes, userRes] = await Promise.all([api.getUserRoles(), api.getUser(userId)]);

      if (rolesRes.success && rolesRes.data) {
        setRoles(extractRoles(rolesRes.data));
      }

      if (!userRes.success || !userRes.data) {
        toast.error(userRes.message || "تعذر تحميل بيانات المستخدم");
        setLoading(false);
        return;
      }

      const user = userRes.data as User;
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        role: user.role || "user",
        is_active: !!user.is_active,
      });
      setLoading(false);
    };

    void load();
  }, [isAdmin, userId]);

  if (!isAdmin) {
    return <div className="text-sm text-muted-foreground">هذه الصفحة للمسؤول فقط.</div>;
  }

  if (!Number.isFinite(userId)) {
    return <div className="text-sm text-muted-foreground">معرف المستخدم غير صالح.</div>;
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">جاري تحميل بيانات المستخدم...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">تعديل المستخدم #{userId}</h1>
          <p className="text-sm text-muted-foreground">عدّل بيانات المستخدم وحالته ودوره.</p>
        </div>
        <Link href="/dashboard/users">
          <Button variant="ghost">رجوع إلى القائمة</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات المستخدم</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              const response = await api.updateUser(userId, form);
              setSubmitting(false);

              if (!response.success) {
                toast.error(response.message || "فشل حفظ التعديلات");
                return;
              }

              toast.success("تم تحديث المستخدم");
              router.push("/dashboard/users");
            }}
          >
            <div className="space-y-2">
              <Label>الاسم الأول</Label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم الأخير</Label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>الدور</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {(roles.length > 0 ? roles : [{ value: "user", label: "user" }]).map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                id="is-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <Label htmlFor="is-active">حساب نشط</Label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
              <Link href="/dashboard/users">
                <Button type="button" variant="secondary">
                  إلغاء
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
