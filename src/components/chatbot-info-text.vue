<template>
  <div class="chatbot_alert_text" :class="type">
    <template v-if="type == 'info'">
       <Info :size="15"/>
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: string;
}

withDefaults(defineProps<Props>(), {
  type: "info",
});
import { Info } from "lucide-vue-next";

const emit = defineEmits(["add"]);
</script>

<style lang="scss">
.chatbot_alert_text {
  display: flex;
  gap: 10px;
  padding: 10px;
  font-size: 14px;
  border-radius: 7px;
  align-items: center;
  svg {
    width: 38px;
  }
  &.info {
    border: 1px solid hsla(44, 82%, 36%, 0.12);
    svg {
      fill: #ffc036;
      stroke: none;
    }
    background: #fff9eb;
    p {
      color: #bd8e0c;
      span {
        font-weight: 600;
        color: #877a42;
      }
    }
  }
}
</style>
