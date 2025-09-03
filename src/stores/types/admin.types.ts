import type { Tenant } from '@/stores/types/tenant.types'
import type { PaginatedApiResponse } from '@/stores/types/pagination.types'

export interface AdminSettings {
    platform_name: string
    support_email: string
    password_policy: {
        min_length: number
    }
    session_timeout: number
    api: {
        rate_limit: number
        webhook_url: string
    }
}

export interface AdminResponse<T> {
    success: boolean
    message?: string
    data: T
}

export interface TenantListResponse extends PaginatedApiResponse<Tenant> { }
export interface TenantResponse extends AdminResponse<Tenant> { }
export interface SettingsResponse extends AdminResponse<AdminSettings> { }
