<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { type BadgeVariants, badgeVariants } from ".";

const props = defineProps<{
  variant?: BadgeVariants["variant"];
  class?: HTMLAttributes["class"];
  hasDot?: boolean;
}>();
</script>

<template>
  <div
    :class="
      cn(badgeVariants({ variant }), props.class, { 'show-dots': props.hasDot })
    "
  >
    <template v-if="hasDot">
      <span class="dot" :class="variant"></span>
    </template>
    <slot />
  </div>
</template>

<style>
span.dot {
  width: 6px;
  height: 6px;
  background: #000;
  border-radius: 50px;
  margin-right: 5px;
  outline-style: none !important;
  &.outline {
    background: #000;
  }
  &.error {
    background: #c60d0d;
  }
  &.success{
    background:#0c9648;
  }
}
</style>
