import { api } from "@/lib/server";
import type { ApiKeyResponses, ApiKeyResponse } from "@/stores/types/apiKeys.types";



interface KeyData {
  key: string;
}

export class apiKeysService {
  private static readonly BASE_PATH = "/api/user/api-keys";

  static async getKeys(): Promise<ApiKeyResponses> {
    const { data } = await api.get<ApiKeyResponses>(
      `${this.BASE_PATH}`
    );
    return data;
  }
  static async post(keyData: KeyData): Promise<ApiKeyResponse> {
    const { data } = await api.post<ApiKeyResponse>(
      `${this.BASE_PATH}`, keyData
    );
    return data;
  }

  static async generatePlatformKey(): Promise<ApiKeyResponse> {
    const { data } = await api.post<ApiKeyResponse>(
      `${this.BASE_PATH}/platform-key`
    );
    return data;
  }
  static async delete(keyId: number): Promise<ApiKeyResponse> {
    const { data } = await api.delete<ApiKeyResponse>(
      `${this.BASE_PATH}/${keyId}`
    );
    return data;
  }

}
