"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type ProfilePayload = {
  address?: string;
  city?: string;
  country?: string;
  birth_date?: string;
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [accountForm, setAccountForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [profileForm, setProfileForm] = useState<ProfilePayload>({
    address: "",
    city: "",
    country: "",
    birth_date: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const [savingAccount, setSavingAccount] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setAccountForm({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || "",
    });
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      const res = await api.getProfile();
      if (!res.success || !res.data) return;
      const data = res.data as ProfilePayload;
      setProfileForm({
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        birth_date: data.birth_date || "",
      });
    };

    void loadProfile();
  }, []);

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingAccount(true);
    const res = await api.updateUser(user.id, accountForm);
    setSavingAccount(false);

    if (!res.success) {
      toast.error(res.message || "فشل تحديث بيانات الحساب");
      return;
    }

    await refreshUser();
    toast.success("تم تحديث بيانات الحساب");
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setSavingProfile(true);
    const res = await api.updateProfile(profileForm);
    setSavingProfile(false);

    if (!res.success) {
      toast.error(res.message || "فشل تحديث الملف الشخصي");
      return;
    }

    toast.success("تم تحديث الملف الشخصي");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    setSavingPassword(true);
    const res = await api.changePassword(passwordForm);
    setSavingPassword(false);

    if (!res.success) {
      toast.error(res.message || "فشل تغيير كلمة المرور");
      return;
    }

    setPasswordForm({ old_password: "", new_password: "", new_password_confirm: "" });
    toast.success("تم تغيير كلمة المرور");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        <p className="text-sm text-muted-foreground">تعديل بيانات الحساب الشخصية وبيانات التواصل.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveAccount} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>الاسم الأول</Label>
              <Input
                value={accountForm.first_name}
                onChange={(e) => setAccountForm({ ...accountForm, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم الأخير</Label>
              <Input
                value={accountForm.last_name}
                onChange={(e) => setAccountForm({ ...accountForm, last_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input
                value={accountForm.phone}
                onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={savingAccount}>
                {savingAccount ? "جاري الحفظ..." : "حفظ بيانات الحساب"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>العنوان</Label>
              <Input
                value={profileForm.address || ""}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>المدينة</Label>
              <Input
                value={profileForm.city || ""}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الدولة</Label>
              <Input
                value={profileForm.country || ""}
                onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الميلاد</Label>
              <Input
                type="date"
                value={profileForm.birth_date || ""}
                onChange={(e) => setProfileForm({ ...profileForm, birth_date: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "جاري الحفظ..." : "حفظ الملف الشخصي"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>كلمة المرور الحالية</Label>
              <Input
                type="password"
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={passwordForm.new_password_confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirm: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
