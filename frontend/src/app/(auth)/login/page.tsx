"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (mounted && !authLoading && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.replace(redirectTo);
    }
  }, [mounted, authLoading, isAuthenticated, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email, password);

      if (response.success) {
        toast.success("تم تسجيل الدخول بنجاح", {
          description: "جاري تحويلك إلى لوحة التحكم...",
        });
        // Use replace instead of push to prevent going back to login
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        router.replace(redirectTo);
      } else {
        setError(response.message || "فشل تسجيل الدخول");
        toast.error("فشل تسجيل الدخول", {
          description: response.message || "تحقق من بيانات الدخول",
        });
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
      toast.error("حدث خطأ غير متوقع");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Right Side - Branding (RTL: appears on right) */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        {/* Logo & Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ERP System</h1>
              <p className="text-blue-200 text-sm">نظام إدارة المخزون والمحاسبة</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">
            نظام متكامل لإدارة
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-cyan-300">
              أعمالك بكفاءة عالية
            </span>
          </h2>

          <div className="space-y-4">
            <FeatureItem
              icon={<ShieldCheck className="w-5 h-5" />}
              title="أمان متقدم"
              description="حماية بياناتك بأحدث تقنيات الأمان"
            />
            <FeatureItem
              icon={<Building2 className="w-5 h-5" />}
              title="إدارة شاملة"
              description="تحكم كامل في المخزون والمحاسبة"
            />
            <FeatureItem
              icon={<Lock className="w-5 h-5" />}
              title="صلاحيات مرنة"
              description="نظام أدوار وصلاحيات متعدد المستويات"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-blue-200 text-sm">
          <p>© 2024 جميع الحقوق محفوظة - نظام ERP متكامل</p>
        </div>
      </div>

      {/* Left Side - Login Form (RTL: appears on left) */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white dark:bg-slate-800">
          <CardHeader className="space-y-4 text-center pb-6">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>

            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                تسجيل الدخول
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 mt-2">
                أدخل بياناتك للوصول إلى لوحة التحكم
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-2">
                  <AlertDescription className="text-right">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-11 h-12 text-right bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-11 pl-11 h-12 text-right bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                    dir="ltr"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400">تذكرني</span>
                </label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>

              <Separator className="my-2" />

              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                <p>نظام ERP متكامل لإدارة المخزون والمحاسبة</p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Feature Item Component
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-300">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-blue-200">{description}</p>
      </div>
    </div>
  );
}
