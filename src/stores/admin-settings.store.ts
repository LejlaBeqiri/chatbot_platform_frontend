import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AdminService } from '@/services/admin.service';

interface AdminSettings {
    platform_name: string;
    support_email: string;
    password_policy: {
        min_length: number;
    };
    session_timeout: number;
    api: {
        rate_limit: number;
        webhook_url: string;
    };
}

export const useAdminSettingsStore = defineStore('adminSettings', () => {
    const settings = ref<AdminSettings | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const getSettings = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await AdminService.getSettings();
            if (response.success) {
                settings.value = response.data;
                return response;
            } else {
                error.value = response.message || 'Failed to fetch settings';
                return response;
            }
        } catch (err: any) {
            error.value = err.message || 'An unexpected error occurred';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateSettings = async (newSettings: Partial<AdminSettings>) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await AdminService.updateSettings(newSettings);
            if (response.success) {
                settings.value = response.data;
                return response;
            } else {
                error.value = response.message || 'Failed to update settings';
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
        settings,
        loading,
        error,
        getSettings,
        updateSettings,
    };
});
