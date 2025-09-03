import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Tenant } from '@/stores/types/tenant.types';
import type { PaginationMeta } from '@/stores/types/pagination.types';
import { AdminService } from '@/services/admin.service';
import type { TenantResponse } from '@/stores/types/admin.types'; // Added import

export const useAdminStore = defineStore('admin', () => {
    const tenants = ref<Tenant[]>([]);
    const currentTenant = ref<Tenant | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const paginationMeta = ref<PaginationMeta | null>(null);

    const getTenants = async (page: number = 1) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await AdminService.getTenants(page);
            if (response.success) {
                tenants.value = response.data.data;
                paginationMeta.value = response.data.meta;
                return response;
            } else {
                error.value = response.message || 'Failed to fetch tenants';
                return response;
            }
        } catch (err: any) {
            error.value = err.message || 'An unexpected error occurred';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const getTenantById = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await AdminService.getTenantById(id);
            if (response.success) {
                currentTenant.value = response.data;
                return response;
            } else {
                error.value = response.message || 'Failed to fetch tenant';
                return response;
            }
        } catch (err: any) {
            error.value = err.message || 'An unexpected error occurred';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateTenant = async (id: number, tenantData: Partial<Tenant>): Promise<TenantResponse> => {
        loading.value = true;
        error.value = null;

        try {

            const dataToSend = { ...tenantData };
            delete dataToSend.created_at;
            delete dataToSend.updated_at;

            const response = await AdminService.updateTenant(id, dataToSend);
            if (response.success) {
                if (currentTenant.value && currentTenant.value.id === id) {
                    currentTenant.value = { ...currentTenant.value, ...response.data };
                }
                const index = tenants.value.findIndex(t => t.id === id);
                if (index !== -1) {
                    tenants.value[index] = { ...tenants.value[index], ...response.data };
                }
                return response;
            } else {
                error.value = response.message || 'Failed to update tenant';
                return response;
            }
        } catch (err: any) {
            error.value = err.message || 'An unexpected error occurred during update';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const createTenant = async (payload: FormData): Promise<TenantResponse> => {
        loading.value = true;
        error.value = null;
        try {
            const response = await AdminService.createTenant(payload);
            if (response.success) {
                await getTenants();
                return response;
            } else {
                error.value = response.message || 'Failed to create tenant';
                return response;
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'An unexpected error occurred during creation';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deleteTenant = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await AdminService.deleteTenant(id);
            if (response.success) {
                tenants.value = tenants.value.filter(t => t.id !== id);
                return response;
            } else {
                error.value = response.message || 'Failed to delete tenant';
                return response;
            }
        } catch (err: any) {
            error.value = err.message || 'An unexpected error occurred';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        tenants,
        currentTenant,
        loading,
        error,
        paginationMeta,
        getTenants,
        getTenantById,
        updateTenant,
        deleteTenant,
        createTenant,
    };
});
