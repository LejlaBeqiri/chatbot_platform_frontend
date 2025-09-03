import { api } from "@/lib/server";
import type { Tenant } from "@/stores/types/tenant.types";
import type {
    TenantListResponse,
    TenantResponse,
    AdminSettings,
    SettingsResponse
} from "@/stores/types/admin.types";
import type { ApiResponse } from "@/stores/types/knowledgeBase.types";

export class AdminService {
    private static readonly BASE_PATH = "/api/admin";

    static async getTenants(page: number = 1): Promise<TenantListResponse> {
        const { data } = await api.get<TenantListResponse>(
            `${this.BASE_PATH}/tenants?page=${page}`
        );
        return data;
    }

    static async getTenantById(id: number): Promise<TenantResponse> {
        const { data } = await api.get<TenantResponse>(
            `${this.BASE_PATH}/tenants/${id}`
        );
        return data;
    }

    static async createTenant(payload: FormData): Promise<TenantResponse> {
        const { data } = await api.post<TenantResponse>(
            `${this.BASE_PATH}/tenants`,
            payload,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return data;
    }

    static async deleteTenant(id: number): Promise<ApiResponse<Tenant | null>> {
        const response = await api.delete<ApiResponse<Tenant | null>>(
            `${this.BASE_PATH}/tenants/${id}`
        );

        if (response.status === 204) {
            return { success: true, message: 'Tenant Deleted Successfully!', data: null };
        }

        return response.data;
    }

    static async updateTenant(id: number, tenantData: Partial<Tenant>): Promise<TenantResponse> {
        const { data } = await api.put<TenantResponse>(
            `${this.BASE_PATH}/tenants/${id}`,
            tenantData
        );
        return data;
    }

    static async getSettings(): Promise<SettingsResponse> {
        const { data } = await api.get<SettingsResponse>(
            `${this.BASE_PATH}/settings`
        );
        return data;
    }

    static async updateSettings(settings: Partial<AdminSettings>): Promise<SettingsResponse> {
        const { data } = await api.put<SettingsResponse>(
            `${this.BASE_PATH}/settings`,
            settings
        );
        return data;
    }
}
