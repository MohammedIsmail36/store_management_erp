"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

// تعريف قواعد التحقق باستخدام Zod
const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح."),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل."),
  remember: z.boolean().default(false).optional(),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // إعداد النموذج باستخدام React Hook Form و Zod
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // دالة تُنفذ عند إرسال النموذج
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);

    try {
      const response = await login(values.email, values.password);

      if (response.success) {
        toast.success("تم تسجيل الدخول بنجاح! جاري التحويل...");
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        router.replace(redirectTo);
      } else {
        toast.error(response.message || "فشل تسجيل الدخول. يرجى التحقق من بياناتك.");
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  }

  // إذا كان المستخدم مسجل الدخول بالفعل، قم بتحويله
  if (isAuthenticated) {
    const redirectTo = searchParams.get("redirect") || "/dashboard";
    router.replace(redirectTo);
    return null;
  }

  return (
    <div className="space-y-6">
      {/* الشعار واسم النظام */}
      <div className="flex justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-xl">ن</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold">نظام إدارة المخزون والمحاسبة</h2>
          <p className="mt-2 text-sm text-muted-foreground">أهلاً بعودتك</p>
        </div>
      </div>

      {/* نموذج تسجيل الدخول */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* حقل البريد الإلكتروني */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@email.com"
                    type="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* حقل كلمة المرور */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>كلمة المرور</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل كلمة المرور"
                    type="password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            {/* خيار "تذكرني" */}
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-reverse space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      تذكرني
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري تسجيل الدخول...
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
