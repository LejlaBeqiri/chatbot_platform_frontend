import type { File } from '@/stores/types/file.types';
import type { Tenant } from '@/stores/types/tenant.types';
import type { PaginatedApiResponse } from '@/stores/types/pagination.types';

export interface KnowledgeBase {
  id: number;
  name: string;
  description?: string;
  tenant: Tenant;
  created_at: string;
  updated_at: string;
  files: File[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface Embedding {
  id: number;
  knowledge_base_id: number;
  tenant_id: number;
  metadata: {
    prompt: string;
    source_text: string;
  };
  created_at: string;
  updated_at: string;
}



export type KnowledgeBaseResponse = ApiResponse<KnowledgeBase>;
export type KnowledgeBasesResponse = ApiResponse<KnowledgeBase[]>;
export type EmbeddingsResponse = PaginatedApiResponse<Embedding>;