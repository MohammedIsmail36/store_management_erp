import type { CompanyInfo } from "@/types/company";

export const COMPANY_UPDATED_EVENT = "company-updated";

function resolveLogoUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export function normalizeCompany(payload: unknown): CompanyInfo {
  if (!payload || typeof payload !== "object") {
    return { name: "Store ERP", company_activity: null, logo: null };
  }

  const data = payload as Record<string, unknown>;
  return {
    name: typeof data.name === "string" && data.name.trim() ? data.name : "Store ERP",
    company_activity: typeof data.company_activity === "string" ? data.company_activity : null,
    logo: resolveLogoUrl(data.logo),
  };
}
