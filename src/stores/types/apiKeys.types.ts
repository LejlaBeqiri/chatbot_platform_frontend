
export interface ApiKey {
  id: number;
  key: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}


export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: { url: string | null; label: string; active: boolean }[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedData<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface PaginatedApiResponse<T> {
  data: PaginatedData<T>;
  success: boolean;
  message?: string;
}

export type ApiKeyResponse = ApiResponse<ApiKey>;
export type ApiKeyResponses = ApiResponse<ApiKey[]>;