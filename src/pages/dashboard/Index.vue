<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useDashboardStore } from '@/stores/dashboard.store';
import { storeToRefs } from 'pinia';
import { onMounted, computed } from 'vue';
import { useColorMode } from '@vueuse/core';
import { BarChart } from '@components/ui/chart-bar';

const dashboardStore = useDashboardStore();
const { statistics, conversationHistory, loading: loadingStats, historyLoading, error } = storeToRefs(dashboardStore);

const mode = useColorMode();
const chartColors = computed(() => [mode.value === 'dark' ? '#fff' : '#000']);

const chartOptions = computed(() => ({
  grid: {
    left: '20px',
    right: '20px',
    top: '20px',
    bottom: '20px',
    containLabel: true
  },
  axisLabel: {
    color: mode.value === 'dark' ? '#fff' : '#000'
  },
  yAxis: {
    axisLine: {
      lineStyle: { color: mode.value === 'dark' ? '#fff' : '#000' }
    },
    splitLine: { show: false },
    axisLabel: { color: mode.value === 'dark' ? '#fff' : '#000' }
  },
  xAxis: {
    axisLine: {
      lineStyle: { color: mode.value === 'dark' ? '#fff' : '#000' }
    },
    axisLabel: { color: mode.value === 'dark' ? '#fff' : '#000' }
  }
}));

onMounted(async () => {
  await Promise.all([
    dashboardStore.fetchStatistics(),
    dashboardStore.fetchConversationHistory()
  ]);
});
</script>

<template>
  <div class="flex-col">
    <div class="flex-1 ">

      <Tabs default-value="overview" class="space-y-4">
        <div class="mobile-scroll-container">
          <TabsList class="w-full sm:w-auto">
            <TabsTrigger value="overview">Dashboard</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" class="space-y-4">
          <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="text-red-400">⚠️</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <div class="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div v-if="loadingStats" class="animate-pulse h-9 w-16 bg-gray-200 rounded"></div>
                <span v-else class="text-3xl font-bold">{{ statistics?.total_conversations || 0 }}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Chatbots</CardTitle>
              </CardHeader>
              <CardContent>
                <div v-if="loadingStats" class="animate-pulse h-9 w-16 bg-gray-200 rounded"></div>
                <span v-else class="text-3xl font-bold">{{ statistics?.total_active_agents || 0 }}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Bases</CardTitle>
              </CardHeader>
              <CardContent>
                <div v-if="loadingStats" class="animate-pulse h-9 w-16 bg-gray-200 rounded"></div>
                <span v-else class="text-3xl font-bold">{{ statistics?.total_knowledge_bases || 0 }}</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div v-if="loadingStats" class="animate-pulse h-9 w-16 bg-gray-200 rounded"></div>
                <span v-else class="text-3xl font-bold">{{ statistics?.total_tenants || 0 }}</span>
              </CardContent>
            </Card>
          </div>

          <Card class="mt-6">
            <CardHeader>
              <CardTitle>Conversations per Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="historyLoading" class="h-[400px] w-full animate-pulse bg-gray-200 rounded"></div>
              <div v-else-if="conversationHistory.length" class="h-[400px]">
                <BarChart
                  :data="conversationHistory"
                  :categories="['total']"
                  index="date"
                  :colors="chartColors"
                  :options="chartOptions"
                  :rounded-corners="4"
                  :bar-padding="0.7"
                />
              </div>
              <div v-else class="h-[400px] flex items-center justify-center text-muted-foreground">
                No conversation data available
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
