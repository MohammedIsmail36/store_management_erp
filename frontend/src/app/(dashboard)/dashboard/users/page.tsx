"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { User } from "@/types/auth";

type Role = {
  value: string;
  label: string;
};

function extractUsers(payload: unknown): User[] {
  if (Array.isArray(payload)) return payload as User[];

  if (payload && typeof payload === "object") {
    const p = payload as {
      data?: unknown;
      results?: unknown;
      items?: unknown;
    };
    if (Array.isArray(p.data)) return p.data as User[];
    if (Array.isArray(p.results)) return p.results as User[];
    if (Array.isArray(p.items)) return p.items as User[];

    // DRF paginated response can return: { results: { success: true, data: [...] } }
    if (p.results && typeof p.results === "object") {
      const r = p.results as { data?: unknown };
      if (Array.isArray(r.data)) return r.data as User[];
    }
  }

  return [];
}

function extractRoles(payload: unknown): Role[] {
  if (!payload || !Array.isArray(payload)) return [];
  if (payload.length === 0) return [];

  if (typeof payload[0] === "string") {
    return (payload as string[]).map((role) => ({ value: role, label: role }));
  }

  return (payload as Role[]).map((role) => ({ value: role.value, label: role.label }));
}

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    const response = await api.getUsers();
    setLoading(false);

    if (!response.success || !response.data) {
      toast.error(response.message || "فشل تحميل المستخدمين");
      return;
    }

    setUsers(extractUsers(response.data));
  };

  const fetchRoles = async () => {
    const response = await api.getUserRoles();
    if (!response.success || !response.data) return;
    setRoles(extractRoles(response.data));
  };

  useEffect(() => {
    if (!isAdmin) return;
    void fetchUsers();
    void fetchRoles();
  }, [isAdmin]);

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const haystack = `${u.full_name} ${u.email} ${u.phone || ""}`.toLowerCase();
        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [users, search, roleFilter]
  );

  const roleFilterOptions: ComboboxOption[] = useMemo(() => [
    { value: "all", label: "كل الأدوار" },
    ...roles.map((role) => ({ value: role.value, label: role.label })),
  ], [roles]);

  if (!isAdmin) {
    return <div className="text-sm text-muted-foreground">هذه الصفحة للمسؤول فقط.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">قائمة المستخدمين</h1>
          <p className="text-sm text-muted-foreground">بحث، فلترة، وإدارة المستخدمين من صفحة مخصصة.</p>
        </div>
        <Link href="/dashboard/users/new">
          <Button>إضافة مستخدم</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
            <p className="mt-2 text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">المستخدمون النشطون</p>
            <p className="mt-2 text-2xl font-bold">{users.filter((u) => u.is_active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">نتائج الفلترة</p>
            <p className="mt-2 text-2xl font-bold">{filteredUsers.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الأدوات</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="ابحث بالاسم أو البريد أو الهاتف"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Combobox
            options={roleFilterOptions}
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="كل الأدوار"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>النتائج</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">جاري التحميل...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              لا توجد نتائج مطابقة.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role_display || u.role}</TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? "success" : "danger"}>
                        {u.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/users/${u.id}`}>
                          <Button variant="secondary">تعديل</Button>
                        </Link>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            const res = await api.deleteUser(u.id);
                            if (!res.success) {
                              toast.error(res.message || "فشل حذف المستخدم");
                              return;
                            }
                            toast.success("تم حذف المستخدم");
                            void fetchUsers();
                          }}
                        >
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
