"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Save,
  Loader2,
  Mail,
  Phone,
  Globe,
  CreditCard,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface CompanySettings {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  tax_number: string;
  commercial_register: string;
  default_currency: string;
  invoice_prefix: string;
  purchase_prefix: string;
}

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    tax_number: "",
    commercial_register: "",
    default_currency: "SAR",
    invoice_prefix: "INV",
    purchase_prefix: "PUR",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.getCompanySettings();
      if (response.success && response.data) {
        const data = response.data as CompanySettings;
        setSettings(data);
        setFormData({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          tax_number: data.tax_number || "",
          commercial_register: data.commercial_register || "",
          default_currency: data.default_currency || "SAR",
          invoice_prefix: data.invoice_prefix || "INV",
          purchase_prefix: data.purchase_prefix || "PUR",
        });
      }
    } catch (error) {
      toast.error("فشل في تحميل الإعدادات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.updateCompanySettings(formData);
      if (response.success) {
        toast.success("تم حفظ الإعدادات بنجاح");
        fetchSettings();
      } else {
        toast.error(response.message || "فشل في حفظ الإعدادات");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">إعدادات الشركة</h1>
        <p className="text-muted-foreground mt-1">
          تعديل معلومات الشركة والإعدادات العامة
        </p>
      </div>

      {/* Company Info Card */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            معلومات الشركة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              اسم الشركة
            </Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="اسم الشركة"
            />
          </div>

          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="عنوان الشركة"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                رقم الهاتف
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="01xxxxxxxx"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@company.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              الموقع الإلكتروني
            </Label>
            <Input
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder="https://www.company.com"
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal Info Card */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            المعلومات القانونية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                الرقم الضريبي
              </Label>
              <Input
                value={formData.tax_number}
                onChange={(e) =>
                  setFormData({ ...formData, tax_number: e.target.value })
                }
                placeholder="300xxxxxxxxxxxxx"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                السجل التجاري
              </Label>
              <Input
                value={formData.commercial_register}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commercial_register: e.target.value,
                  })
                }
                placeholder="10xxxxxxxxx"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings Card */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            إعدادات النظام
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>العملة الافتراضية</Label>
              <Input
                value={formData.default_currency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    default_currency: e.target.value,
                  })
                }
                placeholder="SAR"
              />
            </div>
            <div className="space-y-2">
              <Label>بادئة فاتورة البيع</Label>
              <Input
                value={formData.invoice_prefix}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_prefix: e.target.value })
                }
                placeholder="INV"
              />
            </div>
            <div className="space-y-2">
              <Label>بادئة فاتورة الشراء</Label>
              <Input
                value={formData.purchase_prefix}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_prefix: e.target.value })
                }
                placeholder="PUR"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 ml-2" />
          )}
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}
