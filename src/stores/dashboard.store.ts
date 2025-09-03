import { defineStore } from "pinia";
import { ref } from "vue";
import { DashboardService } from "../services/dashboard.service";
import type { Statistics, ConversationHistory } from "@/stores/types/statistic.types";

export const useDashboardStore = defineStore("dashboard", () => {
    const statistics = ref<Statistics | null>(null);
    const conversationHistory = ref<ConversationHistory[]>([]);
    const loading = ref(false);
    const historyLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchStatistics = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await DashboardService.getStatistics();
            if (response.success) {
                statistics.value = response.data;
            } else {
                error.value = response.message || "Failed to fetch statistics.";
            }
        } catch (err: any) {
            error.value = err.message || "Failed to fetch statistics.";
        } finally {
            loading.value = false;
        }
    };

    const fetchConversationHistory = async () => {
        historyLoading.value = true;
        try {
            const response = await DashboardService.getConversationHistory();
            if (response.success) {
                conversationHistory.value = response.data;
            }
        } catch (err: any) {
            console.error("Failed to fetch conversation history:", err);
        } finally {
            historyLoading.value = false;
        }
    };

    return {
        statistics,
        loading,
        historyLoading,
        error,
        conversationHistory,
        fetchStatistics,
        fetchConversationHistory
    };
});
