import type { ApiResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private get accessToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private get refreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  private setTokens(access: string, refresh: string) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }

  clearSession() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  private async parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
    if (response.status === 204 || response.status === 205) return {};
    try {
      return (await response.json()) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private extractErrorMessage(data: Record<string, unknown>, statusCode?: number): string {
    // 1. Check for direct message
    const directMessage = data.message;
    if (typeof directMessage === "string" && directMessage.trim()) return directMessage;

    // 2. Check for detail (DRF default)
    const detail = data.detail;
    if (typeof detail === "string" && detail.trim()) return detail;

    // 3. Check for error object
    const errorObj = data.error;
    if (errorObj && typeof errorObj === "object") {
      const e = errorObj as { message?: unknown; details?: unknown };
      if (typeof e.message === "string" && e.message.trim()) return e.message;
      if (e.details && typeof e.details === "object") {
        const details = e.details as Record<string, unknown>;
        for (const [field, value] of Object.entries(details)) {
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
            return `${field}: ${value[0]}`;
          }
          if (typeof value === "string" && value.trim()) {
            return `${field}: ${value}`;
          }
        }
      }
    }

    // 4. Check for field errors
    for (const [field, value] of Object.entries(data)) {
      if (field === "success" || field === "message") continue;
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return `${field}: ${value[0]}`;
      }
      if (typeof value === "string" && value.trim()) {
        return `${field}: ${value}`;
      }
    }

    // 5. Fallback with status code
    const statusInfo = statusCode ? ` (HTTP ${statusCode})` : "";
    return `حدث خطأ غير متوقع${statusInfo}. يرجى المحاولة مرة أخرى.`;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
    } catch {
      this.clearSession();
      return false;
    }

    if (!response.ok) {
      this.clearSession();
      return false;
    }

    const data = await this.parseJsonSafe(response);
    const access = data.access as string | undefined;
    const refresh = (data.refresh as string | undefined) ?? this.refreshToken;

    if (!access || !refresh) {
      this.clearSession();
      return false;
    }

    this.setTokens(access, refresh);
    return true;
  }

  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, requiresAuth = true } = options;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const requestHeaders: Record<string, string> = { ...headers };

    if (!isFormData) {
      requestHeaders["Content-Type"] = "application/json";
    }

    if (requiresAuth && this.accessToken) {
      requestHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== "GET") {
      requestOptions.body = isFormData ? (body as FormData) : JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
    } catch {
      return {
        success: false,
        message: "تعذر الاتصال بالخادم. تأكد من تشغيل الباك اند على الرابط الصحيح.",
      };
    }

    if (response.status === 401 && requiresAuth) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed && this.accessToken) {
        requestHeaders.Authorization = `Bearer ${this.accessToken}`;
        try {
          response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...requestOptions,
            headers: requestHeaders,
          });
        } catch {
          return {
            success: false,
            message: "تعذر الاتصال بالخادم. تأكد من الشبكة ثم أعد المحاولة.",
          };
        }
      } else {
        this.clearSession();
        return { success: false, message: "انتهت صلاحية الجلسة" };
      }
    }

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      console.error("API Error:", { status: response.status, data });
      return {
        success: false,
        message: this.extractErrorMessage(data, response.status),
        error: data.error as ApiResponse["error"],
      };
    }

    return {
      success: true,
      message: data.message as string | undefined,
      data: (data.data !== undefined ? data.data : data) as T,
    };
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const result = await this.request<{ access: string; refresh: string; user: unknown }>("/auth/token/", {
      method: "POST",
      body: { email, password },
      requiresAuth: false,
    });

    if (result.success && result.data) {
      this.setTokens(result.data.access, result.data.refresh);
      localStorage.setItem("user", JSON.stringify(result.data.user));
    }

    return result;
  }

  async logout(): Promise<void> {
    const refresh = this.refreshToken;
    if (refresh) {
      await this.request("/auth/logout/", {
        method: "POST",
        body: { refresh },
      });
    }
    this.clearSession();
  }

  getCurrentUser() {
    return this.request("/auth/users/me/");
  }

  getUsers() {
    return this.request("/auth/users/");
  }

  getUser(id: number | string) {
    return this.request(`/auth/users/${id}/`);
  }

  getUserRoles() {
    return this.request("/auth/users/roles/");
  }

  createUser(payload: Record<string, unknown>) {
    return this.request("/auth/users/", { method: "POST", body: payload });
  }

  updateUser(id: number | string, payload: Record<string, unknown>) {
    return this.request(`/auth/users/${id}/`, { method: "PATCH", body: payload });
  }

  deleteUser(id: number | string) {
    return this.request(`/auth/users/${id}/`, { method: "DELETE" });
  }

  getProfile() {
    return this.request("/auth/profiles/my_profile/");
  }

  updateProfile(payload: Record<string, unknown>) {
    return this.request("/auth/profiles/my_profile/", { method: "PATCH", body: payload });
  }

  changePassword(payload: Record<string, unknown>) {
    return this.request("/auth/password/change/", { method: "POST", body: payload });
  }

  getCompanySettings() {
    return this.request("/auth/company/current/");
  }

  updateCompanySettings(payload: Record<string, unknown> | FormData) {
    return this.request("/auth/company/current/", { method: "PATCH", body: payload });
  }
}

export const api = new ApiClient(API_BASE_URL);
