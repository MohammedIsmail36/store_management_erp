"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Lock,
  Save,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    role_display: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
  };
  address?: string;
  city?: string;
  country?: string;
  birth_date?: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.getProfile();
      if (response.success && response.data) {
        const data = response.data as ProfileData;
        setProfile(data);
        setPersonalForm({
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          phone: data.user.phone || "",
        });
      }
    } catch (error) {
      toast.error("فشل في تحميل الملف الشخصي");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePersonal = async () => {
    setIsSaving(true);
    try {
      // Update user data
      const response = await api.updateUser(user?.id || "", {
        first_name: personalForm.first_name,
        last_name: personalForm.last_name,
        phone: personalForm.phone || undefined,
      });

      if (response.success) {
        toast.success("تم تحديث البيانات بنجاح");
        refreshUser();
        fetchProfile();
      } else {
        toast.error(response.message || "فشل في تحديث البيانات");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
        new_password_confirm: passwordForm.new_password_confirm,
      });

      if (response.success) {
        toast.success("تم تغيير كلمة المرور بنجاح");
        setPasswordForm({
          old_password: "",
          new_password: "",
          new_password_confirm: "",
        });
      } else {
        toast.error(response.message || "فشل في تغيير كلمة المرور");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-primary">الملف الشخصي</h1>
        <p className="text-muted-foreground mt-1">
          عرض وتعديل بياناتك الشخصية
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.user.full_name}</h2>
              <p className="text-muted-foreground">{profile?.user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge>{profile?.user.role_display}</Badge>
                {profile?.user.is_active ? (
                  <Badge className="bg-green-500">نشط</Badge>
                ) : (
                  <Badge variant="destructive">غير نشط</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="gap-2">
            <User className="h-4 w-4" />
            البيانات الشخصية
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            الأمان
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                البيانات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم الأول</Label>
                  <Input
                    value={personalForm.first_name}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        first_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>الاسم الأخير</Label>
                  <Input
                    value={personalForm.last_name}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </Label>
                <Input
                  value={profile?.user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  لا يمكن تغيير البريد الإلكتروني
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  رقم الهاتف
                </Label>
                <Input
                  value={personalForm.phone}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, phone: e.target.value })
                  }
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  الدور
                </Label>
                <Input
                  value={profile?.user.role_display}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  تاريخ الإنشاء
                </Label>
                <Input
                  value={
                    profile?.user.created_at
                      ? new Date(profile.user.created_at).toLocaleDateString(
                          "ar-SA"
                        )
                      : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdatePersonal} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 ml-2" />
                  )}
                  حفظ التغييرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                تغيير كلمة المرور
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>كلمة المرور الحالية</Label>
                <Input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      old_password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label>كلمة المرور الجديدة</Label>
                <Input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  يجب أن تكون 8 أحرف على الأقل
                </p>
              </div>

              <div className="space-y-2">
                <Label>تأكيد كلمة المرور الجديدة</Label>
                <Input
                  type="password"
                  value={passwordForm.new_password_confirm}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password_confirm: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleChangePassword} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 ml-2" />
                  )}
                  تغيير كلمة المرور
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
