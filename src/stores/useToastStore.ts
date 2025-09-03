import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ToastProps {
  id: string
  message: string
  title?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  persistent?: boolean
  action?: {
    text: string
    callback: () => void
  }
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)

    console.log('Adding toast to store:', { ...toast, id })
    toasts.value.push({ ...toast, id })
    return id
  }

  const removeToast = (id: string) => {
    console.log('Removing toast:', id)
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const findToast = (id: string) => {
    return toasts.value.find(t => t.id === id)
  }

  const clearAll = () => {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    findToast,
    clearAll
  }
})