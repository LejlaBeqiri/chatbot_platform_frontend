<template>
  <AlertDialog :open="open" @update:open="updateOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ props.title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ props.description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="onCancel">Cancel</AlertDialogCancel>
        <AlertDialogAction @click="onConfirm">{{ props.confirmText }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  title?: string;
  description?: string;
  confirmText?: string;
}>(), {
  title: 'Are you sure?',
  description: 'This action cannot be undone.',
  confirmText: 'Confirm',
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const open = ref(false);

const updateOpen = (value: boolean) => {
  open.value = value;
  if (!value) {
    onCancel();
  }
};

const onConfirm = () => {
  emit('confirm');
  open.value = false;
};

const onCancel = () => {
  emit('cancel');
  open.value = false;
};

const showDialog = () => {
  open.value = true;
};

defineExpose({
  showDialog
});
</script>