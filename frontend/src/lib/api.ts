/**
 * عميل API للاتصال بـ Django Backend
 * API Client for Django Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, refreshToken);
        return true;
      }
      
      this.clearTokens();
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, requiresAuth = true } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (requiresAuth) {
      const token = this.getAccessToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== "GET") {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      let response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);

      // Try to refresh token if unauthorized
      if (response.status === 401 && requiresAuth) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          const newToken = this.getAccessToken();
          if (newToken) {
            requestHeaders["Authorization"] = `Bearer ${newToken}`;
            response = await fetch(`${this.baseUrl}${endpoint}`, {
              ...requestOptions,
              headers: requestHeaders,
            });
          }
        } else {
          this.clearTokens();
          window.location.href = "/login";
          return {
            success: false,
            message: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى",
          };
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.detail || "حدث خطأ غير متوقع",
          error: data.error || {
            code: "API_ERROR",
            message: data.message || "حدث خطأ غير متوقع",
            details: data,
          },
        };
      }

      return {
        success: true,
        data: data.data !== undefined ? data.data : data,
        message: data.message,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        message: "تعذر الاتصال بالخادم",
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.request("/auth/token/", {
      method: "POST",
      body: { email, password },
      requiresAuth: false,
    });

    if (response.success && response.data) {
      const { access, refresh, user } = response.data as {
        access: string;
        refresh: string;
        user: unknown;
      };
      this.setTokens(access, refresh);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response;
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      await this.request("/auth/logout/", {
        method: "POST",
        body: { refresh: refreshToken },
      });
    }
    this.clearTokens();
  }

  // Users endpoints
  async getUsers(params?: Record<string, string>): Promise<ApiResponse> {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return this.request(`/auth/users/${query}`);
  }

  async getUser(id: string): Promise<ApiResponse> {
    return this.request(`/auth/users/${id}/`);
  }

  async createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    role: string;
    phone?: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/users/", {
      method: "POST",
      body: userData,
    });
  }

  async updateUser(
    id: string,
    userData: {
      first_name?: string;
      last_name?: string;
      role?: string;
      phone?: string;
      is_active?: boolean;
    }
  ): Promise<ApiResponse> {
    return this.request(`/auth/users/${id}/`, {
      method: "PATCH",
      body: userData,
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/auth/users/${id}/`, {
      method: "DELETE",
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.request("/auth/users/me/");
  }

  async getUserRoles(): Promise<ApiResponse> {
    return this.request("/auth/users/roles/");
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse> {
    return this.request("/auth/profiles/my_profile/");
  }

  async updateProfile(profileData: {
    address?: string;
    city?: string;
    country?: string;
    birth_date?: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/profiles/my_profile/", {
      method: "PATCH",
      body: profileData,
    });
  }

  async changePassword(passwordData: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/password/change/", {
      method: "POST",
      body: passwordData,
    });
  }

  // Company settings
  async getCompanySettings(): Promise<ApiResponse> {
    return this.request("/auth/company/current/");
  }

  async updateCompanySettings(settings: Record<string, unknown>): Promise<ApiResponse> {
    return this.request("/auth/company/current/", {
      method: "PATCH",
      body: settings,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export type { ApiResponse };
