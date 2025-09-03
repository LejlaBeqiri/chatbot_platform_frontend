export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  tenant: Tenant | null
}

export interface Tenant {
  id: string;
  business_name: string;
  phone?: string;
  domain?: string;
  country?: string;
  industry?: string;
  language?: string
  logo_url?: string
  timezone?: string
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  success: boolean;
  message: string | null;
  data: {
    user: User;
  }
}


export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loggedIn: boolean;
}
