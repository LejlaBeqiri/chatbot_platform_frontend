<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { useFormField } from './useFormField'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { formDescriptionId } = useFormField()
</script>

<template>
  <p
    :id="formDescriptionId"
    :class="cn('text-sm text-muted-foreground', props.class)"
    class="chatbot_form_description"
  >
    <slot />
  </p>
</template>

<style lang="scss">
  .chatbot_form_description{
    font-size: 12px;
    p{
     
      color: #636363;
    }
  }
</style>