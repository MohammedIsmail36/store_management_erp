"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin123456");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.message || "فشل تسجيل الدخول");
      return;
    }

    toast.success("تم تسجيل الدخول");
    router.replace("/dashboard");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">تسجيل الدخول</h1>
        <p className="text-sm text-muted-foreground">أدخل بيانات حسابك</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm">البريد الإلكتروني</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm">كلمة المرور</label>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "جاري الدخول..." : "دخول"}
      </Button>
    </form>
  );
}
