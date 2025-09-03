<template>
    <div>
        <!-- <p class="text-sm">{{ t(currentTitle) }}</p> -->
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app.store";
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { PAGE_TITLES } from '@/config/page-titles';
import type { PageTitleKey } from '@/config/page-titles';

const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const updatePageTitle = (routeName: string | symbol | null): void => {
    const validRouteName = routeName as PageTitleKey;
    const title = typeof routeName === 'string' && routeName in PAGE_TITLES
        ? PAGE_TITLES[validRouteName]
        : PAGE_TITLES.default;

    appStore.setPageTitle(title);
};

const currentTitle = computed<string>(() => appStore.page_title);

// Watch for route changes
watch(
    () => router.currentRoute.value.name,
    (newRouteName: string | symbol | undefined) => updatePageTitle(newRouteName ?? null),
    { immediate: true }
);
</script>

<style scoped></style>