import type { Embedding, KnowledgeBase, KnowledgeBaseResponse } from '@/stores/types/knowledgeBase.types';
import type { ApiResponse } from '@/stores/types/knowledgeBase.types';
import type { PaginatedApiResponse } from '@/stores/types/pagination.types';
import { api } from "@/lib/server";
import type { File as KnowledgeFile } from '@/stores/types/file.types';

export interface ICreateKnowledgeBase {
  name: string;
  description: string;
}

export class KnowledgeBaseService {
  private static getBasePath(): string {
    return "api/user";
  }

  static async createKnowledgeBase(data: ICreateKnowledgeBase): Promise<KnowledgeBaseResponse> {
    try {
      const { data: response } = await api.post<KnowledgeBaseResponse>(
        `${this.getBasePath()}/knowledge-bases`,
        data
      );
      return response;
    } catch (error) {
      console.error('Create knowledge base error:', error);
      throw error;
    }
  }

  static async getAllKnowledgeBases(page: number = 1): Promise<PaginatedApiResponse<KnowledgeBase>> {
    try {
      const { data } = await api.get<PaginatedApiResponse<KnowledgeBase>>(
        `${this.getBasePath()}/knowledge-bases`,
        {
          params: { page }
        }
      );

      return data;
    } catch (error) {
      console.error('Knowledge base API error:', error);
      throw error;
    }
  }

  static async getKnowledgeBaseByID(id: number): Promise<KnowledgeBaseResponse> {
    try {
      const { data } = await api.get<KnowledgeBaseResponse>(
        `${this.getBasePath()}/knowledge-bases/${id}`
      );
      return data;
    } catch (error) {
      console.error('Get knowledge base error:', error);
      throw error;
    }
  }

  static async getKnowledgeBaseEmbeddings(id: number, page: number) {
    try {
      const { data } = await api.get<PaginatedApiResponse<Embedding>>(
        `${this.getBasePath()}/knowledge-bases/${id}/embeddings`,
        {
          params: {
            page
          }
        }
      );
      return data;
    } catch (error) {
      console.error('Get knowledge base error:', error);
      throw error;
    }
  }

  static async delete(knowledgebaseId: number): Promise<KnowledgeBaseResponse> {
    try {
      const { data } = await api.delete<KnowledgeBaseResponse>(
        `${this.getBasePath()}/knowledge-bases/${knowledgebaseId}`
      );
      return data;
    } catch (error) {
      console.error('Get knowledge base error:', error);
      throw error;
    }
  }

  static async downloadFile(fileId: string, knowledgeBaseId: number): Promise<ApiResponse<ArrayBuffer>> {
    try {
      const response = await api.get(`${this.getBasePath()}/knowledge-bases/download/${knowledgeBaseId}/${fileId}`, {
        responseType: 'arraybuffer'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        data: new ArrayBuffer(0),
        message: error.response?.data?.message || 'Failed to download file'
      };
    }
  }

  static async uploadDocuments(
    files: File[],
    knowledgeBaseId: number
  ): Promise<ApiResponse<KnowledgeFile[]>> {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files[]", file, file.name);
      });

      const { data } = await api.post<ApiResponse<KnowledgeFile[]>>(
        `${this.getBasePath()}/knowledge-bases/upload/${knowledgeBaseId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return data;
    } catch (error) {
      console.error("Error uploading documents:", error);
      throw error;
    }
  }

  static async uploadDocument(
    file: File,
    knowledgeBaseId: number
  ): Promise<ApiResponse<KnowledgeFile>> {
    return this.uploadDocuments([file], knowledgeBaseId).then(response => {
      return {
        success: response.success,
        data: response.data[0],
        message: response.message
      };
    });
  }

  static async deleteFile(fileId: string, knowledgeBaseId: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`${this.getBasePath()}/knowledge-bases/delete-file/${knowledgeBaseId}/${fileId}`)
      return {
        success: true,
        data: undefined
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: error.response?.data?.message || 'Failed to delete file'
      };
    }
  }

  static async addEmbeddings(
    knowledgeBaseId: number,
    payload: { embeddings: Array<{ source_text: string; metadata: { prompt: string | null } }> }
  ): Promise<ApiResponse<null>> {
    try {
      const { data: response } = await api.post<ApiResponse<null>>(
        `${this.getBasePath()}/knowledge-bases/${knowledgeBaseId}/embeddings`,
        payload
      );
      return response;
    } catch (error: any) {
      console.error('Add embeddings error:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to add embeddings'
      };
    }
  }

  static async deleteEmbedding(
    knowledgeBaseId: number,
    embeddingId: number
  ): Promise<ApiResponse<null>> {
    try {
      const { data: response } = await api.delete<ApiResponse<null>>(
        `${this.getBasePath()}/embeddings/${knowledgeBaseId}/${embeddingId}`
      );
      return response;
    } catch (error: any) {
      console.error('Add embeddings error:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to add embeddings'
      };
    }
  }
}
