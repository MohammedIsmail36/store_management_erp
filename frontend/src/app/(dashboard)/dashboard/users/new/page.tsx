"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Role = { value: string; label: string };

const newUserSchema = z
  .object({
    first_name: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل"),
    last_name: z.string().min(2, "الاسم الأخير يجب أن يكون حرفين على الأقل"),
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    phone: z.string().optional(),
    role: z.string().min(1, "اختر الدور"),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    password_confirm: z.string().min(8, "تأكيد كلمة المرور يجب أن يكون 8 أحرف على الأقل"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "تأكيد كلمة المرور غير مطابق",
    path: ["password_confirm"],
  });

type NewUserForm = z.infer<typeof newUserSchema>;
type FieldErrors = Partial<Record<keyof NewUserForm, string>>;
const allowedFields: Array<keyof NewUserForm> = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "role",
  "password",
  "password_confirm",
];

function extractRoles(payload: unknown): Role[] {
  if (!payload || !Array.isArray(payload)) return [];
  if (payload.length === 0) return [];

  if (typeof payload[0] === "string") {
    return (payload as string[]).map((role) => ({ value: role, label: role }));
  }

  return (payload as Role[]).map((role) => ({ value: role.value, label: role.label }));
}

function extractBackendFieldErrors(details: unknown): FieldErrors {
  if (!details || typeof details !== "object") return {};
  const result: FieldErrors = {};
  const obj = details as Record<string, unknown>;

  for (const [field, value] of Object.entries(obj)) {
    if (!allowedFields.includes(field as keyof NewUserForm)) continue;
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
      result[field as keyof NewUserForm] = value[0];
      continue;
    }
    if (typeof value === "string" && value.trim()) {
      result[field as keyof NewUserForm] = value;
    }
  }

  return result;
}

export default function NewUserPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState<NewUserForm>({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
    role: "user",
    phone: "",
  });

  useEffect(() => {
    if (!isAdmin) return;
    const loadRoles = async () => {
      const response = await api.getUserRoles();
      if (!response.success || !response.data) return;
      setRoles(extractRoles(response.data));
    };
    void loadRoles();
  }, [isAdmin]);

  if (!isAdmin) {
    return <div className="text-sm text-muted-foreground">هذه الصفحة للمسؤول فقط.</div>;
  }

  const setField = <K extends keyof NewUserForm>(key: K, value: NewUserForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">إضافة مستخدم جديد</h1>
          <p className="text-sm text-muted-foreground">أنشئ حسابًا جديدًا مع الدور والصلاحيات المناسبة.</p>
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
              setFieldErrors({});

              const parsed = newUserSchema.safeParse(form);
              if (!parsed.success) {
                const nextErrors: FieldErrors = {};
                for (const issue of parsed.error.issues) {
                  const field = issue.path[0] as keyof NewUserForm | undefined;
                  if (!field || nextErrors[field]) continue;
                  nextErrors[field] = issue.message;
                }
                setFieldErrors(nextErrors);
                toast.error("يرجى تصحيح الحقول المطلوبة");
                return;
              }

              setSubmitting(true);
              const response = await api.createUser(parsed.data);
              setSubmitting(false);

              if (!response.success) {
                const backendErrors = extractBackendFieldErrors(response.error?.details);
                if (Object.keys(backendErrors).length > 0) {
                  setFieldErrors(backendErrors);
                }
                toast.error(response.message || "فشل إنشاء المستخدم");
                return;
              }

              toast.success("تم إنشاء المستخدم");
              router.push("/dashboard/users");
            }}
          >
            <div className="space-y-2">
              <Label>الاسم الأول</Label>
              <Input value={form.first_name} onChange={(e) => setField("first_name", e.target.value)} />
              {fieldErrors.first_name ? <p className="text-xs text-destructive">{fieldErrors.first_name}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>الاسم الأخير</Label>
              <Input value={form.last_name} onChange={(e) => setField("last_name", e.target.value)} />
              {fieldErrors.last_name ? <p className="text-xs text-destructive">{fieldErrors.last_name}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
              {fieldErrors.email ? <p className="text-xs text-destructive">{fieldErrors.email}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input value={form.phone || ""} onChange={(e) => setField("phone", e.target.value)} />
              {fieldErrors.phone ? <p className="text-xs text-destructive">{fieldErrors.phone}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} />
              {fieldErrors.password ? <p className="text-xs text-destructive">{fieldErrors.password}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور</Label>
              <Input
                type="password"
                value={form.password_confirm}
                onChange={(e) => setField("password_confirm", e.target.value)}
              />
              {fieldErrors.password_confirm ? (
                <p className="text-xs text-destructive">{fieldErrors.password_confirm}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>الدور</Label>
              <Select value={form.role} onChange={(e) => setField("role", e.target.value)}>
                {(roles.length > 0 ? roles : [{ value: "user", label: "user" }]).map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
              {fieldErrors.role ? <p className="text-xs text-destructive">{fieldErrors.role}</p> : null}
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "جاري الحفظ..." : "حفظ المستخدم"}
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
