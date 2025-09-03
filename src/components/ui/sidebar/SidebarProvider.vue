<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useEventListener, useMediaQuery } from "@vueuse/core";
import { TooltipProvider } from "radix-vue";
import { computed, type HTMLAttributes, ref } from "vue";
import { useAppStore } from "@/stores/app.store";
import {
  provideSidebarContext,
  SIDEBAR_COOKIE_MAX_AGE,
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_KEYBOARD_SHORTCUT,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
} from "./utils";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
  }>(),
  {}
);

const appStore = useAppStore();
const isMobile = useMediaQuery("(max-width: 768px)");
const openMobile = ref(false);

function setOpen(value: boolean) {
  appStore.setSidebarState(value);
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

function setOpenMobile(value: boolean) {
  openMobile.value = value;
}

function toggleSidebar() {
  return isMobile.value
    ? setOpenMobile(!openMobile.value)
    : setOpen(!appStore.isOpen);
}

useEventListener("keydown", (event: KeyboardEvent) => {
  if (
    event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
    (event.metaKey || event.ctrlKey)
  ) {
    event.preventDefault();
    toggleSidebar();
  }
});

const state = computed(() => (appStore.sidebar_is_open ? "expanded" : "collapsed"));

provideSidebarContext({
  state,
  open: computed(() => appStore.sidebar_is_open),
  setOpen,
  isMobile,
  openMobile,
  setOpenMobile,
  toggleSidebar,
});
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <div
      :style="{
        '--sidebar-width': SIDEBAR_WIDTH,
        '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
      }"
      :class="
        cn(
          'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
          props.class
        )
      "
      v-bind="$attrs"
    >
      <slot />
    </div>
  </TooltipProvider>
</template>
