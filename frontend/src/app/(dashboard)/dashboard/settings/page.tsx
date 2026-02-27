"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { COMPANY_UPDATED_EVENT } from "@/lib/company";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type CompanyForm = {
  name: string;
  company_activity: string;
  logo: string | null;
  address: string;
  phone: string;
  email: string;
  website: string;
  tax_number: string;
  commercial_register: string;
  default_currency: string;
  invoice_prefix: string;
  purchase_prefix: string;
};

const defaultForm: CompanyForm = {
  name: "",
  company_activity: "",
  logo: null,
  address: "",
  phone: "",
  email: "",
  website: "",
  tax_number: "",
  commercial_register: "",
  default_currency: "SAR",
  invoice_prefix: "INV",
  purchase_prefix: "PUR",
};

const DEFAULT_COMPANY_LOGO = "/company-logo-placeholder.svg";

function normalizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function resolveLogoUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function normalizeCompanyForm(payload: unknown): CompanyForm {
  if (!payload || typeof payload !== "object") return defaultForm;
  const data = payload as Record<string, unknown>;

  return {
    name: normalizeText(data.name),
    company_activity: normalizeText(data.company_activity),
    logo: resolveLogoUrl(data.logo),
    address: normalizeText(data.address),
    phone: normalizeText(data.phone),
    email: normalizeText(data.email),
    website: normalizeText(data.website),
    tax_number: normalizeText(data.tax_number),
    commercial_register: normalizeText(data.commercial_register),
    default_currency: normalizeText(data.default_currency, "SAR"),
    invoice_prefix: normalizeText(data.invoice_prefix, "INV"),
    purchase_prefix: normalizeText(data.purchase_prefix, "PUR"),
  };
}

export default function SettingsPage() {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompanyForm>(defaultForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const res = await api.getCompanySettings();
      setLoading(false);

      if (!res.success || !res.data) {
        toast.error(res.message || "فشل تحميل إعدادات الشركة");
        return;
      }

      setForm(normalizeCompanyForm(res.data));
    };

    void load();
  }, [isAdmin]);

  const displayedLogo = logoPreview || form.logo || DEFAULT_COMPANY_LOGO;

  const submitPayload = useMemo(() => {
    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("company_activity", form.company_activity);
    payload.append("address", form.address);
    payload.append("phone", form.phone);
    payload.append("email", form.email);
    payload.append("website", form.website);
    payload.append("tax_number", form.tax_number);
    payload.append("commercial_register", form.commercial_register);
    payload.append("default_currency", form.default_currency);
    payload.append("invoice_prefix", form.invoice_prefix);
    payload.append("purchase_prefix", form.purchase_prefix);
    if (logoFile) {
      payload.append("logo", logoFile);
    } else if (removeLogo) {
      // Explicitly clear current logo on backend.
      payload.append("logo", "");
    }
    return payload;
  }, [form, logoFile, removeLogo]);

  if (!isAdmin) {
    return <div className="text-sm text-muted-foreground">هذه الصفحة للمسؤول فقط.</div>;
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">جاري تحميل الإعدادات...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-l from-white to-secondary/50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">إعدادات الشركة</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              شاشة إعدادات منظمة لإدارة هوية المتجر والبيانات الرسمية والفوترة.
            </p>
          </div>
          <Badge variant="outline">لوحة المسؤول</Badge>
        </div>
      </div>

      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          const res = await api.updateCompanySettings(submitPayload);
          setSaving(false);

          if (!res.success) {
            toast.error(res.message || "فشل حفظ الإعدادات");
            return;
          }

          toast.success("تم حفظ الإعدادات");
          if (res.data) {
            setForm(normalizeCompanyForm(res.data));
            window.dispatchEvent(new Event(COMPANY_UPDATED_EVENT));
          }
          setLogoFile(null);
          setRemoveLogo(false);
        }}
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-8">
            <CardHeader className="pb-2">
              <CardTitle>البيانات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>اسم الشركة</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>نشاط الشركة</Label>
                <Input value={form.company_activity} onChange={(e) => setForm({ ...form, company_activity: e.target.value })} placeholder="تجارة جملة، تجارة تجزئة، خدمات..." />
              </div>
              <div className="space-y-2">
                <Label>الهاتف</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>الموقع الإلكتروني</Label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>العنوان</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle>هوية المتجر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label>شعار الشركة</Label>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="group relative flex h-52 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/35 text-right"
              >
                {displayedLogo ? (
                  <img
                    src={displayedLogo}
                    alt="شعار الشركة"
                    className="h-full w-full bg-white p-3 object-contain"
                  />
                ) : null}
                <div className="absolute inset-0 hidden items-end justify-center bg-black/40 pb-3 text-xs font-medium text-white group-hover:flex">
                  اضغط لتغيير الشعار
                </div>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setLogoFile(file);
                  if (file) setRemoveLogo(false);
                }}
              />
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => logoInputRef.current?.click()}>
                  اختيار صورة
                </Button>
                {(logoFile || form.logo) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setLogoFile(null);
                      setRemoveLogo(true);
                      setForm((prev) => ({ ...prev, logo: null }));
                    }}
                  >
                    إزالة
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">يتم حفظ الصورة مع زر حفظ الإعدادات.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>بيانات رسمية</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>الرقم الضريبي</Label>
                <Input
                  value={form.tax_number}
                  onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>السجل التجاري</Label>
                <Input
                  value={form.commercial_register}
                  onChange={(e) => setForm({ ...form, commercial_register: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>إعدادات الفواتير</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>العملة الافتراضية</Label>
                <Input
                  value={form.default_currency}
                  onChange={(e) => setForm({ ...form, default_currency: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>بادئة الفواتير</Label>
                  <Input
                    value={form.invoice_prefix}
                    onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>بادئة المشتريات</Label>
                  <Input
                    value={form.purchase_prefix}
                    onChange={(e) => setForm({ ...form, purchase_prefix: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="submit" disabled={saving} className="min-w-36">
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </form>
    </div>
  );
}
