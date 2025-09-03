import type { StatisticsResponse, ConversationHistoryResponse } from "@/stores/types/statistic.types";
import { api } from "@/lib/server";

export class DashboardService {
    private static readonly STATS_PATH = "/api/user/statistics";
    private static readonly HISTORY_PATH = "/api/user/conversation-history";

    static async getStatistics(): Promise<StatisticsResponse> {
        const { data } = await api.get<StatisticsResponse>(
            `${this.STATS_PATH}`
        );
        return data;
    }

    static async getConversationHistory(): Promise<ConversationHistoryResponse> {
        const { data } = await api.get<ConversationHistoryResponse>(
            `${this.HISTORY_PATH}`
        );
        return data;
    }
}
