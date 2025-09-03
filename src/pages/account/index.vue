<script setup lang="ts">
import { ref,computed } from "vue";
import AccountSection from "@/components/account/AccountSection.vue";
import ProfileSection from "@/components/account/ProfileSection.vue";
import OtherSection from "@/components/account/OtherSection.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth.store";

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');

const activeSection = ref("account");
</script>

<template>
  <div class="flex-col">
    <div class="flex-1 ">
      <div class="flex items-center justify-between space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs v-model="activeSection" class="w-full" default-value="account">
        <div class="mobile-scroll-container">
          <TabsList
            class="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
          >
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger v-if="!isAdmin"  value="profile">Profile</TabsTrigger>
            <!-- <TabsTrigger value="other">Other</TabsTrigger> -->
          </TabsList>
        </div>

        <div class="mt-6">
          <TabsContent value="account">
            <AccountSection />
          </TabsContent>
          <TabsContent v-if="!isAdmin" value="profile">
            <ProfileSection />
          </TabsContent>
          <TabsContent value="other">
            <OtherSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  </div>
</template>
