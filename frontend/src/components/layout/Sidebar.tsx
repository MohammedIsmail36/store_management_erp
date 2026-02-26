"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Settings,
  User,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  LogOut,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "الرئيسية",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "المستخدمين",
    href: "/dashboard/users",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "الملف الشخصي",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "إعدادات الشركة",
    href: "/dashboard/settings",
    icon: Building2,
    adminOnly: true,
  },
  // Future modules - disabled
  {
    title: "شجرة الحسابات",
    href: "#",
    icon: BarChart3,
    disabled: true,
  },
  {
    title: "المخزون",
    href: "#",
    icon: Package,
    disabled: true,
  },
  {
    title: "المشتريات",
    href: "#",
    icon: ShoppingCart,
    disabled: true,
  },
  {
    title: "المبيعات",
    href: "#",
    icon: FileText,
    disabled: true,
  },
];

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-64 border-l bg-card shadow-lg">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-primary">ERP</h1>
            <p className="text-[10px] text-muted-foreground">إدارة المخزون</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col h-[calc(100vh-4rem)] p-4">
        <div className="flex-1 space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.title}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground cursor-not-allowed opacity-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.title}</span>
                  <span className="mr-auto text-[10px] bg-muted px-2 py-0.5 rounded">
                    قريباً
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role_display}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 ml-2" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </nav>
    </aside>
  );
}
