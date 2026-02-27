"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import type { CompanyInfo } from "@/types/company";

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3 4.5-5 8-5s6.5 2 8 5" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function Header({ company }: { company: CompanyInfo }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white/70 px-6 backdrop-blur">
      <div>
        <h2 className="text-base font-semibold">مرحبًا، {user?.first_name}</h2>
        <p className="text-xs text-muted-foreground">نظرة سريعة على {company.name}</p>
      </div>

      <div className="relative" ref={menuRef}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
          className="h-10 gap-2 border border-border bg-white px-2 hover:bg-secondary/60"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-primary">
            <IconUser />
          </span>
          <span className="max-w-40 truncate text-sm font-medium">{user?.full_name || "المستخدم"}</span>
          <IconChevron />
        </Button>

        {open ? (
          <div className="absolute left-0 z-20 mt-2 w-60 rounded-xl border border-border bg-white p-2 shadow-lg">
            <div className="border-b border-border px-2 pb-2">
              <p className="text-sm font-semibold">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-secondary"
              >
                <IconUser />
                <span>الملف الشخصي</span>
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-right text-sm text-destructive hover:bg-secondary"
              >
                <IconLogout />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
