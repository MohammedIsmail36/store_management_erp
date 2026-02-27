"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { CompanyInfo } from "@/types/company";

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
  accountantOnly?: boolean;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/dashboard/accounts", label: "شجرة الحسابات", accountantOnly: true },
  { href: "/dashboard/journal-entries", label: "القيود المحاسبية", accountantOnly: true },
  { href: "/dashboard/users", label: "المستخدمين", adminOnly: true },
  { href: "/dashboard/profile", label: "الملف الشخصي" },
  { href: "/dashboard/settings", label: "إعدادات الشركة", adminOnly: true },
];

const DEFAULT_COMPANY_LOGO = "/company-logo-placeholder.svg";

export function Sidebar({ company }: { company: CompanyInfo }) {
  const pathname = usePathname();
  const { isAdmin, isAccountant } = useAuth();

  const filteredItems = items.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.accountantOnly && !isAccountant) return false;
    return true;
  });

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-card/95 backdrop-blur">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-3">
          <img
            src={company.logo || DEFAULT_COMPANY_LOGO}
            alt={company.name}
            className="h-9 w-9 rounded-lg border border-border bg-white p-1 object-contain"
          />
          <div>
            <h1 className="text-base font-bold text-primary">{company.name}</h1>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 p-3">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
