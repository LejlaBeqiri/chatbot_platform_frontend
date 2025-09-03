import type { User } from '@/stores/types/auth.types';

export interface Tenant {
  id: number;
  business_name: string;
  industry?: string;
  logo_url?: string;
  country?: string;
  language?: string;
  phone?: string;
  user?: User;
  domain?: string;
  created_at?: string;
  updated_at?: string;
}