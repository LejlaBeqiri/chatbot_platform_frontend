import { defineStore } from 'pinia';
import { KnowledgeBaseService } from '@/services/knowledge.service';
import type { PaginationMeta, PaginationLinks } from '@/stores/types/pagination.types';
import type {
  KnowledgeBase,
  Embedding,
  EmbeddingsResponse
} from './types/knowledgeBase.types';

interface KnowledgeBaseState {
  currentKnowledgeBase: KnowledgeBase | null;
  knowledgeBases: KnowledgeBase[];
  loading: boolean;
  error: string | null;
  paginationLinks: PaginationLinks | null;
  paginationMeta: PaginationMeta | null;

  embeddings: Embedding[];
  embeddingsPaginationLinks: PaginationLinks | null;
  embeddingsPaginationMeta: PaginationMeta | null;
  loadingEmbeddings: boolean;
  errorEmbeddings: string | null;
}

export const useKnowledgeBaseStore = defineStore('knowledgeBase', {
  state: (): KnowledgeBaseState => ({
    currentKnowledgeBase: null,
    knowledgeBases: [],
    loading: false,
    error: null,
    paginationLinks: null,
    paginationMeta: null,

    embeddings: [],
    embeddingsPaginationLinks: null,
    embeddingsPaginationMeta: null,
    loadingEmbeddings: false,
    errorEmbeddings: null,
  }),

  actions: {
    async fetchKnowledgeBaseById(kbId: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await KnowledgeBaseService.getKnowledgeBaseByID(kbId);
        if (response.success) {
          this.currentKnowledgeBase = response.data;
          this.embeddings = [];
          this.paginationLinks = null;
          this.paginationMeta = null;
        } else {
          this.error = response.message || 'Failed to fetch knowledge base';
        }
      } catch (error: any) {
        this.error = error.message || 'An unexpected error occurred';
        console.error('Error fetching knowledge base:', error);
      } finally {
        this.loading = false;
      }
    },

    async getKnowledgeBases(page: number = 1) {
      this.loading = true;
      this.error = null;
      try {
        const response = await KnowledgeBaseService.getAllKnowledgeBases(page);
        if (response.success) {
          this.knowledgeBases = response.data.data;
          this.paginationLinks = response.data.links;
          this.paginationMeta = response.data.meta;
          return response;
        } else {
          this.error = response.message || 'Failed to fetch knowledge bases';
          this.knowledgeBases = [];
          this.paginationLinks = null;
          this.paginationMeta = null;
          return response;
        }
      } catch (error: any) {
        this.error = error.message || 'An unexpected error occurred';
        this.knowledgeBases = [];
        this.paginationLinks = null;
        this.paginationMeta = null;
        console.error('Error fetching knowledge bases:', error);

        return { success: false, message: this.error, data: { data: [], links: null, meta: null } };
      } finally {
        this.loading = false;
      }
    },

    clearCurrentKnowledgeBase() {
      this.currentKnowledgeBase = null;
      this.embeddings = [];
      this.paginationLinks = null;
      this.paginationMeta = null;
    },

    async fetchEmbeddings(knowledgeBaseId: number, page: number = 1) {
      this.loadingEmbeddings = true;
      this.errorEmbeddings = null;
      try {
        const response: EmbeddingsResponse = await KnowledgeBaseService.getKnowledgeBaseEmbeddings(knowledgeBaseId, page);
        if (response.success) {
          this.embeddings = response.data.data;
          this.embeddingsPaginationLinks = response.data.links;
          this.embeddingsPaginationMeta = response.data.meta;
        } else {
          this.errorEmbeddings = response.message || 'Failed to fetch embeddings';
          this.embeddings = [];
          this.embeddingsPaginationLinks = null;
          this.embeddingsPaginationMeta = null;
        }
      } catch (error: any) {
        this.errorEmbeddings = error.message || 'An error occurred while fetching embeddings.';
        this.embeddings = [];
        this.embeddingsPaginationLinks = null
        this.embeddingsPaginationMeta = null
        console.error('Error fetching embeddings:', error);
      } finally {
        this.loadingEmbeddings = false;
      }
    },

    async addEmbeddings(knowledgeBaseId: number, embeddingsData: Array<{ metadata: { prompt: string; source_text: string } }>) {
      this.errorEmbeddings = null;

      try {
        const payload = {
          embeddings: embeddingsData.map(embed => ({
            source_text: embed.metadata.source_text,
            metadata: {
              prompt: embed.metadata.prompt || null
            }
          }))
        };

        const response = await KnowledgeBaseService.addEmbeddings(knowledgeBaseId, payload);

        if (!response.success) {
          this.errorEmbeddings = response.message || 'Failed to add embeddings';
          throw new Error(this.errorEmbeddings);
        }

        if (this.embeddingsPaginationMeta) {
          await this.fetchEmbeddings(knowledgeBaseId, this.embeddingsPaginationMeta.current_page);
        }
        return response;
      } catch (error: any) {
        this.errorEmbeddings = error.message || 'An error occurred while adding embeddings.';
        console.error('Error adding embeddings:', error);
        throw error;
      } finally {
        this.loadingEmbeddings = false;
      }
    },

    async deleteEmbedding(knowledgeBaseId: number, embeddingId: number) {
      this.errorEmbeddings = null;
      try {
        const response = await KnowledgeBaseService.deleteEmbedding(knowledgeBaseId, embeddingId);
        if (!response.success) {
          this.errorEmbeddings = response.message || 'Failed to delete embedding';
          throw new Error(this.errorEmbeddings);
        }
        let pageToFetch = this.embeddingsPaginationMeta?.current_page || 1;
        if (this.embeddings.length === 1 && pageToFetch > 1) {
          pageToFetch--;
        }
        await this.fetchEmbeddings(knowledgeBaseId, pageToFetch);

        return response;
      } catch (error: any) {
        this.errorEmbeddings = error.message || 'An error occurred while deleting the embedding.';
        console.error('Error deleting embedding:', error);
        throw error;
      } finally {
        this.loadingEmbeddings = false;
      }
    }
  },

  getters: {
    hasKnowledgeBase: (state) => state.currentKnowledgeBase !== null,
    getCurrentKnowledgeBase: (state) => state.currentKnowledgeBase,
    getKnowledgeBaseName: (state) => state.currentKnowledgeBase?.name || 'Unknown Knowledge Base',
    getKnowledgeBaseCreationDate: (state) => {
      if (!state.currentKnowledgeBase?.created_at) return '';
      return new Date(state.currentKnowledgeBase.created_at).toLocaleDateString();
    },
    getAllKnowledgeBases: (state) => state.knowledgeBases,
    getKnowledgeBasePaginationMeta: (state) => state.paginationMeta,
    getKnowledgeBasePaginationLinks: (state) => state.paginationLinks,

    getCurrentEmbeddings: (state) => state.embeddings,
    getEmbeddingsPaginationMeta: (state) => state.embeddingsPaginationMeta,
    getEmbeddingsPaginationLinks: (state) => state.embeddingsPaginationLinks,
    isLoadingEmbeddings: (state) => state.loadingEmbeddings,
  }
});