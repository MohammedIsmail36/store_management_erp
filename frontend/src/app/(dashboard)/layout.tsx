"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { COMPANY_UPDATED_EVENT, normalizeCompany } from "@/lib/company";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import type { CompanyInfo } from "@/types/company";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [company, setCompany] = useState<CompanyInfo>({ name: "Store ERP", logo: null });

  const loadCompany = async () => {
    const response = await api.getCompanySettings();
    if (!response.success || !response.data) return;
    setCompany(normalizeCompany(response.data));
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadCompany();
  }, [isAuthenticated]);

  useEffect(() => {
    const onCompanyUpdated = () => {
      void loadCompany();
    };
    window.addEventListener(COMPANY_UPDATED_EVENT, onCompanyUpdated);
    return () => window.removeEventListener(COMPANY_UPDATED_EVENT, onCompanyUpdated);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center">جاري التحقق...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar company={company} />
      <div className="flex-1 min-w-0">
        <Header company={company} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
