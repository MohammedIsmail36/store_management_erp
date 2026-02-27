"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import type { Account, AccountType, AccountTypeOption, AccountFormData } from "@/types/accounting";

const defaultFormData: AccountFormData = {
  code: "",
  name: "",
  account_type: "asset",
  parent: null,
  is_active: true,
  is_header: false,
  allow_manual_entry: true,
  opening_balance: 0,
  notes: "",
};

export default function AccountsPage() {
  const { isAccountant } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(defaultFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    const [accountsRes, typesRes] = await Promise.all([
      api.getAccounts(),
      api.getAccountTypes(),
    ]);
    setLoading(false);

    if (accountsRes.success && accountsRes.data) {
      setAccounts(accountsRes.data as Account[]);
    } else {
      toast.error(accountsRes.message || "فشل تحميل الحسابات");
    }

    if (typesRes.success && typesRes.data) {
      setAccountTypes(typesRes.data as AccountTypeOption[]);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Combobox options for filter
  const filterTypeOptions: ComboboxOption[] = useMemo(() => [
    { value: "all", label: "جميع الأنواع" },
    ...accountTypes.map((type) => ({ value: type.value, label: type.label })),
  ], [accountTypes]);

  // Combobox options for account type in form
  const accountTypeOptions: ComboboxOption[] = useMemo(() => 
    accountTypes.map((type) => ({ value: type.value, label: type.label })),
    [accountTypes]
  );

  // Combobox options for parent account
  const parentAccountOptions: ComboboxOption[] = useMemo(() => {
    const headerAccounts = accounts.filter((a) => a.is_header && a.id !== editingAccount?.id);
    return [
      { value: "none", label: "بدون أب (حساب رئيسي)" },
      ...headerAccounts.map((account) => ({
        value: account.id.toString(),
        label: `${account.code} - ${account.name}`,
      })),
    ];
  }, [accounts, editingAccount]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || account.account_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [accounts, searchTerm, filterType]);

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        code: account.code,
        name: account.name,
        account_type: account.account_type,
        parent: account.parent,
        is_active: account.is_active,
        is_header: account.is_header,
        allow_manual_entry: account.allow_manual_entry,
        opening_balance: account.opening_balance,
        notes: account.notes || "",
      });
    } else {
      setEditingAccount(null);
      setFormData(defaultFormData);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingAccount(null);
    setFormData(defaultFormData);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      parent: formData.parent || null,
    };

    let res;
    if (editingAccount) {
      res = await api.updateAccount(editingAccount.id, payload);
    } else {
      res = await api.createAccount(payload);
    }
    setSaving(false);

    if (!res.success) {
      toast.error(res.message || "فشل الحفظ");
      return;
    }

    toast.success(editingAccount ? "تم تحديث الحساب" : "تم إنشاء الحساب");
    handleCloseDialog();
    loadData();
  };

  const handleDelete = async (account: Account) => {
    if (!confirm(`هل أنت متأكد من حذف الحساب "${account.name}"؟`)) return;

    const res = await api.deleteAccount(account.id);
    if (!res.success) {
      toast.error(res.message || "فشل الحذف");
      return;
    }

    toast.success("تم حذف الحساب");
    loadData();
  };

  const getAccountTypeColor = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      asset: "bg-blue-100 text-blue-800",
      liability: "bg-red-100 text-red-800",
      equity: "bg-purple-100 text-purple-800",
      revenue: "bg-green-100 text-green-800",
      expense: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!isAccountant) {
    return (
      <div className="text-sm text-muted-foreground">
        هذه الصفحة للمحاسب أو المسؤول فقط.
      </div>
    );
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-l from-white to-secondary/50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">شجرة الحسابات</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة الحسابات المحاسبية والهيكل المحاسبي للشركة.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>إضافة حساب</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="بحث برقم أو اسم الحساب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Combobox
              options={filterTypeOptions}
              value={filterType}
              onChange={setFilterType}
              placeholder="فلترة حسب النوع"
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الحساب</TableHead>
                  <TableHead>اسم الحساب</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرصيد الحالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا توجد حسابات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {account.name}
                          {account.is_header && (
                            <Badge variant="outline" className="text-xs">رئيسي</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAccountTypeColor(account.account_type)}>
                          {account.account_type_display}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatNumber(account.current_balance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.is_active ? "default" : "secondary"}>
                          {account.is_active ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(account)}
                          >
                            تعديل
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(account)}
                            disabled={account.children_count > 0}
                          >
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "تعديل حساب" : "إضافة حساب جديد"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الحساب *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="1، 1.1، 1.1.1"
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الحساب *</Label>
                <Combobox
                  options={accountTypeOptions}
                  value={formData.account_type}
                  onChange={(value) => setFormData({ ...formData, account_type: value as AccountType })}
                  placeholder="اختر النوع"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>اسم الحساب *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="اسم الحساب"
              />
            </div>

            <div className="space-y-2">
              <Label>الحساب الأب</Label>
              <Combobox
                options={parentAccountOptions}
                value={formData.parent?.toString() || "none"}
                onChange={(value) => setFormData({ ...formData, parent: value === "none" ? null : parseInt(value) })}
                placeholder="بدون أب (حساب رئيسي)"
                emptyMessage="لا توجد حسابات رئيسية"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الرصيد الافتتاحي</Label>
                <Input
                  type="number"
                  value={formData.opening_balance}
                  onChange={(e) =>
                    setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">نشط</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_header}
                  onChange={(e) => setFormData({ ...formData, is_header: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">حساب رئيسي (ليس للقيود)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_manual_entry}
                  onChange={(e) => setFormData({ ...formData, allow_manual_entry: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">يسمح بالقيود اليدوية</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
