<template>

  <div class="pb-4 relative space-y-6">
    <chatbotAgentsBreadcrumbs />
    <div class="flex items-center justify-between" v-if="agentStore.hasAgent">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ agentStore.getAgentName }}</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Created on {{ agentStore.getAgentCreationDate }}
        </p>
      </div>
    </div>
    <div v-else-if="agentStore.loading" class="py-4">
      <p>Loading agent details...</p>
    </div>
    <div v-else-if="agentStore.error" class="py-4 text-red-500">
      <p>{{ agentStore.error }}</p>
    </div>

    <Tabs :default-value="activeTab" class="w-full">
      <TabsList class="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value"
          class="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground">
          <div class="flex items-center">
            <component :is="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.label }}
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
        <component :is="tab.component" />
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgentStore } from "@/stores/agent.store";
import chatbotAgentsBreadcrumbs from "@components/breadcrumbs/AgentDetails-breadcrumbs.vue";
import TabSettings from "./AgentTabs/TabSettings.vue";
import TabWidget from "./AgentTabs/TabWidget.vue";
import Chats from "./AgentTabs/Conversations.vue";

const route = useRoute();
const agentStore = useAgentStore();
const activeTab = ref("chats");
import {
  Settings2,
  Code,
} from "lucide-vue-next";
import { ChatBubbleIcon } from "@radix-icons/vue";
import TabPlayground from "./AgentTabs/TabPlayground.vue";
import { useAuthStore } from "@/stores/auth.store";

const authStore = useAuthStore();

const isAdmin = computed(() => authStore.user?.role === 'admin');

const allTabs = [
  {
    label: "Chats",
    value: "chats",
    component: Chats,
    icon: ChatBubbleIcon,
  },
  {
    label: "Settings",
    value: "settings",
    component: TabSettings,
    icon: Settings2,
  },
  {
    label: "Playground",
    value: "playground",
    component: TabPlayground,
    icon: Settings2,
  },
  { label: "Integration Guide", value: "widget", component: TabWidget, icon: Code },
];

const tabs = computed(() => {
  if (isAdmin.value) {
    return allTabs.filter(tab => !['widget', 'playground'].includes(tab.value));
  }
  return allTabs;
});


watch(
  () => route.query.tab,  
  (newTab) => {
    if (newTab && tabs.value.some((tab) => tab.value === newTab)) {
      activeTab.value = newTab as string;
    }
  }
);

onMounted(async () => {

  const agentId = route.params.id
  await agentStore.fetchAgentById(Number(agentId));


  if (route.query.tab && tabs.value.some((tab) => tab.value === route.query.tab)) {
    activeTab.value = route.query.tab as string;
  }
});



</script>
