<template>
  <div class="relative">
    <Select
      :model-value="displayValue"
      :placeholder="placeholder"
      @update:model-value="handleSelect"
    >
      <SelectTrigger class="w-full">
        <div class="flex flex-wrap gap-1">
          <template v-if="modelValue.length">
            <Badge
              v-for="item in selectedItems"
              :key="item.value"
              variant="secondary"
              class="mr-1"
            >
              {{ item.label }}
              <button
                class="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                @click.stop="removeItem(item)"
              >
                <X class="h-3 w-3" />
              </button>
            </Badge>
          </template>
          <span v-else class="text-muted-foreground">{{ placeholder }}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              <Checkbox
                :id="option.value"
                :model-value="isSelected(option.value)"
                @update:model-value="() => handleSelect(option.value)"
              />
            </span>
            <span>{{ option.label }}</span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { X } from 'lucide-vue-next';
import { Badge } from '../badge';
import { Checkbox } from '../checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '../select';

interface Option {
  label: string;
  value: string;
}

const props = defineProps<{
  modelValue: string[];
  options: Option[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const selectedItems = computed(() => {
  return props.options.filter(option => props.modelValue.includes(option.value));
});

const displayValue = computed(() => {
  return props.modelValue[0] || '';
});

const isSelected = (value: string) => {
  return props.modelValue.includes(value);
};

const handleSelect = (value: string) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(value);
  
  if (index === -1) {
    newValue.push(value);
  } else {
    newValue.splice(index, 1);
  }
  
  emit('update:modelValue', newValue);
};

const removeItem = (item: Option) => {
  const newValue = props.modelValue.filter(value => value !== item.value);
  emit('update:modelValue', newValue);
};
</script>