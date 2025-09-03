<script setup lang="ts">
import { cn } from '@/lib/utils'
import { CheckIcon } from '@radix-icons/vue'
import {
  SelectItem,
  SelectItemIndicator,
  type SelectItemProps,
  SelectItemText,
  useForwardProps,
} from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectItem
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.class,
      )
    "
  >
    <!-- <span class="chatbot_select_identifier">
      <SelectItemIndicator>
        <CheckIcon class="h-4 w-4" />
      </SelectItemIndicator>
    </span> -->

    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>

<style lang="scss">
.chatbot_select_identifier{
  position:absolute;
  right: -10px;
  display:flex;
  height: 30px;
  width: 35px !important;
  align-items: center;
  justify-content:center;
}

</style>