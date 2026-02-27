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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type {
  JournalEntryListItem,
  JournalEntry,
  JournalEntryLineFormData,
  Account,
  FiscalYear,
  JournalEntryStatus,
} from "@/types/accounting";

const defaultLine: JournalEntryLineFormData = {
  account: 0,
  debit: 0,
  credit: 0,
  description: "",
  cost_center: "",
};

export default function JournalEntriesPage() {
  const { isAccountant, isAdmin } = useAuth();
  const [entries, setEntries] = useState<JournalEntryListItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [activeFiscalYear, setActiveFiscalYear] = useState<FiscalYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntryListItem | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    fiscal_year: 0,
    description: "",
    reference: "",
    lines: [{ ...defaultLine }, { ...defaultLine }],
  });

  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, accountsRes, fiscalYearsRes, activeFyRes] = await Promise.all([
        api.getJournalEntries(),
        api.getAccounts(),
        api.getFiscalYears(),
        api.getActiveFiscalYear(),
      ]);

      if (entriesRes.success && entriesRes.data) {
        setEntries(entriesRes.data as JournalEntryListItem[]);
      }

      if (accountsRes.success && accountsRes.data) {
        setAccounts((accountsRes.data as Account[]).filter((a) => !a.is_header && a.is_active));
      }

      if (fiscalYearsRes.success && fiscalYearsRes.data) {
        setFiscalYears(fiscalYearsRes.data as FiscalYear[]);
      }

      if (activeFyRes.success && activeFyRes.data) {
        setActiveFiscalYear(activeFyRes.data as FiscalYear);
        setFormData((prev) => ({ ...prev, fiscal_year: (activeFyRes.data as FiscalYear).id }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Combobox options
  const statusFilterOptions: ComboboxOption[] = useMemo(() => [
    { value: "all", label: "جميع الحالات" },
    { value: "draft", label: "مسودة" },
    { value: "posted", label: "مرحل" },
    { value: "cancelled", label: "ملغي" },
  ], []);

  const fiscalYearOptions: ComboboxOption[] = useMemo(() => 
    fiscalYears
      .filter((fy) => !fy.is_closed)
      .map((fy) => ({ value: fy.id.toString(), label: fy.name })),
    [fiscalYears]
  );

  const accountOptions: ComboboxOption[] = useMemo(() => 
    accounts.map((acc) => ({
      value: acc.id.toString(),
      label: `${acc.code} - ${acc.name}`,
    })),
    [accounts]
  );

  const filteredEntries = useMemo(() => {
    if (filterStatus === "all") return entries;
    return entries.filter((e) => e.status === filterStatus);
  }, [entries, filterStatus]);

  const totalDebit = useMemo(() => {
    return formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  }, [formData.lines]);

  const totalCredit = useMemo(() => {
    return formData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  }, [formData.lines]);

  const isBalanced = useMemo(() => {
    return totalDebit === totalCredit && totalDebit > 0;
  }, [totalDebit, totalCredit]);

  const handleOpenDialog = (entry?: JournalEntryListItem) => {
    if (entry) {
      api.getJournalEntry(entry.id).then((res) => {
        if (res.success && res.data) {
          const fullEntry = res.data as JournalEntry;
          setEditingEntry(entry);
          setFormData({
            date: fullEntry.date,
            fiscal_year: fullEntry.fiscal_year,
            description: fullEntry.description,
            reference: fullEntry.reference || "",
            lines: fullEntry.lines.map((l) => ({
              account: l.account,
              debit: l.debit,
              credit: l.credit,
              description: l.description || "",
              cost_center: l.cost_center || "",
            })),
          });
          setShowDialog(true);
        }
      });
    } else {
      setEditingEntry(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        fiscal_year: activeFiscalYear?.id || 0,
        description: "",
        reference: "",
        lines: [{ ...defaultLine }, { ...defaultLine }],
      });
      setShowDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingEntry(null);
  };

  const handleLineChange = (index: number, field: keyof JournalEntryLineFormData, value: string | number) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({ ...formData, lines: [...formData.lines, { ...defaultLine }] });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length <= 2) {
      toast.error("القيد يجب أن يحتوي على بندان على الأقل");
      return;
    }
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const handleSave = async () => {
    if (!formData.date || !formData.description || !formData.fiscal_year) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!isBalanced) {
      toast.error(`القيد غير متوازن: المدين ${totalDebit} ≠ الدائن ${totalCredit}`);
      return;
    }

    const invalidLines = formData.lines.filter((l) => l.account === 0 || (l.debit === 0 && l.credit === 0));
    if (invalidLines.length > 0) {
      toast.error("يرجى اختيار الحساب وإدخال المبلغ لكل بند");
      return;
    }

    setSaving(true);
    const payload = {
      date: formData.date,
      fiscal_year: formData.fiscal_year,
      description: formData.description,
      reference: formData.reference || null,
      lines: formData.lines.map((l) => ({
        account: l.account,
        debit: l.debit,
        credit: l.credit,
        description: l.description || null,
        cost_center: l.cost_center || null,
      })),
    };

    let res;
    if (editingEntry) {
      res = await api.updateJournalEntry(editingEntry.id, payload);
    } else {
      res = await api.createJournalEntry(payload);
    }
    setSaving(false);

    if (!res.success) {
      toast.error(res.message || "فشل الحفظ");
      return;
    }

    toast.success(editingEntry ? "تم تحديث القيد" : "تم إنشاء القيد");
    handleCloseDialog();
    loadData();
  };

  const handlePost = async (entry: JournalEntryListItem) => {
    if (!confirm(`هل أنت متأكد من ترحيل القيد "${entry.entry_number}"؟`)) return;

    const res = await api.postJournalEntry(entry.id);
    if (!res.success) {
      toast.error(res.message || "فشل الترحيل");
      return;
    }

    toast.success("تم ترحيل القيد بنجاح");
    loadData();
  };

  const handleCancel = async (entry: JournalEntryListItem) => {
    const reason = prompt("سبب الإلغاء:");
    if (!reason) return;

    const res = await api.cancelJournalEntry(entry.id, reason);
    if (!res.success) {
      toast.error(res.message || "فشل الإلغاء");
      return;
    }

    toast.success("تم إلغاء القيد");
    loadData();
  };

  const handleDelete = async (entry: JournalEntryListItem) => {
    if (!confirm(`هل أنت متأكد من حذف القيد "${entry.entry_number}"؟`)) return;

    const res = await api.deleteJournalEntry(entry.id);
    if (!res.success) {
      toast.error(res.message || "فشل الحذف");
      return;
    }

    toast.success("تم حذف القيد");
    loadData();
  };

  const handleView = async (entry: JournalEntryListItem) => {
    const res = await api.getJournalEntry(entry.id);
    if (res.success && res.data) {
      setViewingEntry(res.data as JournalEntry);
      setShowViewDialog(true);
    } else {
      toast.error("فشل تحميل تفاصيل القيد");
    }
  };

  const getStatusColor = (status: JournalEntryStatus) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "posted":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-SA");
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
            <h1 className="text-2xl font-bold">القيود المحاسبية</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إنشاء وإدارة القيود المحاسبية.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>قيد جديد</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-4">
            <Combobox
              options={statusFilterOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="فلترة حسب الحالة"
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم القيد</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>المدين</TableHead>
                  <TableHead>الدائن</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      لا توجد قيود
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">{entry.entry_number}</TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                      <TableCell className="font-mono">{formatNumber(entry.total_debit)}</TableCell>
                      <TableCell className="font-mono">{formatNumber(entry.total_credit)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status_display}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(entry)}>
                            عرض
                          </Button>
                          {entry.status === "draft" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(entry)}>
                                تعديل
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handlePost(entry)}>
                                ترحيل
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(entry)}
                              >
                                حذف
                              </Button>
                            </>
                          )}
                          {entry.status === "posted" && isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleCancel(entry)}
                            >
                              إلغاء
                            </Button>
                          )}
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

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "تعديل قيد" : "قيد محاسبي جديد"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>التاريخ *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>السنة المالية *</Label>
                <Combobox
                  options={fiscalYearOptions}
                  value={formData.fiscal_year.toString()}
                  onChange={(value) => setFormData({ ...formData, fiscal_year: parseInt(value) })}
                  placeholder="اختر السنة المالية"
                  emptyMessage="لا توجد سنوات مالية"
                />
              </div>
              <div className="space-y-2">
                <Label>المرجع</Label>
                <Input
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="رقم الفاتورة، أمر الشراء..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الوصف *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف القيد..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>بنود القيد</Label>
                <Button variant="outline" size="sm" onClick={addLine}>
                  إضافة بند
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-64">الحساب</TableHead>
                      <TableHead className="w-32">مدين</TableHead>
                      <TableHead className="w-32">دائن</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Combobox
                            options={accountOptions}
                            value={line.account.toString()}
                            onChange={(value) => handleLineChange(index, "account", parseInt(value))}
                            placeholder="اختر الحساب"
                            emptyMessage="لا توجد حسابات"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.debit || ""}
                            onChange={(e) => handleLineChange(index, "debit", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.credit || ""}
                            onChange={(e) => handleLineChange(index, "credit", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.description}
                            onChange={(e) => handleLineChange(index, "description", e.target.value)}
                            placeholder="وصف البند"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeLine(index)}>
                            ✕
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted p-3">
              <div className="flex gap-8">
                <div>
                  <span className="text-sm text-muted-foreground">إجمالي المدين: </span>
                  <span className="font-mono font-bold">{formatNumber(totalDebit)}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">إجمالي الدائن: </span>
                  <span className="font-mono font-bold">{formatNumber(totalCredit)}</span>
                </div>
              </div>
              <Badge variant={isBalanced ? "default" : "destructive"}>
                {isBalanced ? "متوازن" : "غير متوازن"}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving || !isBalanced}>
              {saving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={() => setShowViewDialog(false)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تفاصيل القيد</DialogTitle>
          </DialogHeader>

          {viewingEntry && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">رقم القيد:</span>
                  <span className="ms-2 font-mono">{viewingEntry.entry_number}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">التاريخ:</span>
                  <span className="ms-2">{formatDate(viewingEntry.date)}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">السنة المالية:</span>
                  <span className="ms-2">{viewingEntry.fiscal_year_name}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">الحالة:</span>
                  <Badge className={`ms-2 ${getStatusColor(viewingEntry.status)}`}>
                    {viewingEntry.status_display}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">أنشئ بواسطة:</span>
                  <span className="ms-2">{viewingEntry.created_by_name}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">تاريخ الإنشاء:</span>
                  <span className="ms-2">{formatDate(viewingEntry.created_at)}</span>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">الوصف:</span>
                <p className="mt-1">{viewingEntry.description}</p>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الحساب</TableHead>
                      <TableHead className="text-right">مدين</TableHead>
                      <TableHead className="text-right">دائن</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingEntry.lines.map((line, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {line.account_code} - {line.account_name}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {line.debit > 0 ? formatNumber(line.debit) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {line.credit > 0 ? formatNumber(line.credit) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted font-bold">
                      <TableCell>الإجمالي</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(viewingEntry.total_debit)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(viewingEntry.total_credit)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
