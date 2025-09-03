import { api } from "@/lib/server";
import type { AuthResponse } from "@/stores/types/auth.types";
import { useAuthStore } from "@/stores/auth.store";

interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private static readonly BASE_PATH = "/api";

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      `${this.BASE_PATH}/login`,
      credentials
    );

    if (data.success) {
      const authStore = useAuthStore();
      authStore.setAuthData(data.data);
    }

    return data;
  }

  static async logout(): Promise<void> {
    const authStore = useAuthStore();
    authStore.clearAuth();
  }

  static async changePassword(
    old_password: string,
    newPassword: string,
    password_confirmation: string
  ): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      `${this.BASE_PATH}/user/change-password`,
      {
        old_password: old_password,
        new_password: newPassword,
        new_password_confirmation: password_confirmation
      }
    );

    return data;
  }

  static async changeDomain(
    domain: string,
  ): Promise<AuthResponse> {
    const { data } = await api.put<AuthResponse>(
      `${this.BASE_PATH}/user/profile`,
      {
        domain
      }
    );

    return data;
  }
}
