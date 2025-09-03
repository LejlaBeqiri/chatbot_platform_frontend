<script setup lang="ts">
import { useToastStore, type ToastProps } from '@/stores/useToastStore'
import emitter from '@events'
import { onMounted, onUnmounted } from 'vue'
import type { BaseToastPayload } from '@/utils/eventBus'

const store = useToastStore()

const showToast = (options: Omit<ToastProps, 'id'> & { persistent?: boolean }) => {
  console.log(options)
  const toastProps: Omit<ToastProps, 'id'> = {
    ...options,
    persistent: options.persistent === true, // explicitly set persistent flag
    duration: options.persistent ? undefined : (options.duration || 3000)
  }
  const id = store.addToast(toastProps)

  // Set auto-hide only if not persistent and duration is defined
  if (!toastProps.persistent && toastProps.duration) {
    setTimeout(() => {
      hideToast(id)
    }, toastProps.duration)
  }

  return id
}

const hideToast = (id: string) => {
  store.removeToast(id)
}

const handleSuccess = (payload: BaseToastPayload) => {
  console.log('Show success toast:', payload)
  return showToast({
    ...payload,
    type: 'success',
    duration: 3000, 
  })
}

const handleError = (payload: BaseToastPayload) => {
  console.log('Show error toast:', payload)
  return showToast({
    ...payload,
    type: 'error',
    duration: 5000, 
  })
}

const handleWarning = (payload: BaseToastPayload) => {
  console.log('Show warning toast:', payload)
  return showToast({
    ...payload,
    type: 'warning',
    duration: 4000, 
  })
}

const handleToast = (config: {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  persistent?: boolean
  onMount?: (id: string) => void
  action?: {
    text: string
    callback: () => void
  }
}) => {
  const id = showToast({
    ...config,
    duration: config.persistent ? undefined : 3000
  })


  if (config.onMount) {
    config.onMount(id)
  }

  return id
}


const handleHideAll = () => {
  store.clearAll()
}


const handleHideToast = (id: string) => {
  hideToast(id)
}


onMounted(() => {
  emitter.on('hide-all-toasts', handleHideAll)
  emitter.on('hide-toast', handleHideToast)
  emitter.on('show-toast', handleToast)
  emitter.on('show-success', handleSuccess)
  emitter.on('show-error', handleError)
  emitter.on('show-warning', handleWarning)
})

onUnmounted(() => {
  emitter.off('hide-all-toasts', handleHideAll)
  emitter.off('hide-toast', handleHideToast)
  emitter.off('show-toast', handleToast)
  emitter.off('show-success', handleSuccess)
  emitter.off('show-error', handleError)
  emitter.off('show-warning', handleWarning)
})
</script>

<template>
  <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div v-for="toast in store.toasts" :key="toast.id"
        class="toast-item min-w-[300px] max-w-[400px] p-3 rounded-lg shadow-lg text-white" :class="toast.type">
        <div class="flex items-center relative">
          <!-- Icon based on type -->
          <div class="chatbot_toast_status" :class="toast.type">

          </div>
          <div class="flex-1 min-w-0 chatbot_toast_text">
            <p v-if="toast.title" class="font-bold">{{ toast.title }}</p>
            <p v-if="toast.message">{{ toast.message }}</p>
          </div>
          <div class="chatbot_toast_action" v-if="toast.action && toast.action.text">
            <button @click="toast.action.callback" class="rounded text-sm text-white ">
              {{ toast.action.text }}
            </button>
          </div>

          <div class="chatbot_toast_action" v-else>
            <button @click="hideToast(toast.id)" class="rounded text-sm text-white ">
              Close
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.toast-item {
  animation: slideIn 0.3s ease-out;
  background: #171717;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.chatbot_toast_text {
  font-size: 13px;
  font-weight: 500;
  margin-right: 15px;
}

.chatbot_toast_status {

  width: 16px;
  height: 16px;
  border-radius: 50px;
  margin-right: 10px;

  &.success {
    background: hsla(152, 100%, 50%, 1);

    background: linear-gradient(90deg, hsla(152, 100%, 50%, 1) 0%, hsla(186, 100%, 69%, 1) 100%);

    background: -moz-linear-gradient(90deg, hsla(152, 100%, 50%, 1) 0%, hsla(186, 100%, 69%, 1) 100%);

    background: -webkit-linear-gradient(90deg, hsla(152, 100%, 50%, 1) 0%, hsla(186, 100%, 69%, 1) 100%);

  }

  &.error {

    background: hsla(356, 76%, 50%, 1);

    background: linear-gradient(90deg, hsla(356, 76%, 50%, 1) 0%, hsla(14, 63%, 36%, 1) 100%);

    background: -moz-linear-gradient(90deg, hsla(356, 76%, 50%, 1) 0%, hsla(14, 63%, 36%, 1) 100%);

    background: -webkit-linear-gradient(90deg, hsla(356, 76%, 50%, 1) 0%, hsla(14, 63%, 36%, 1) 100%);
  }

  &.info {
    background: hsla(40, 94%, 74%, 1);

    background: linear-gradient(90deg, hsla(40, 94%, 74%, 1) 0%, hsla(60, 89%, 72%, 1) 100%);

    background: -moz-linear-gradient(90deg, hsla(40, 94%, 74%, 1) 0%, hsla(60, 89%, 72%, 1) 100%);

    background: -webkit-linear-gradient(90deg, hsla(40, 94%, 74%, 1) 0%, hsla(60, 89%, 72%, 1) 100%);
  }

  &.warning {
    background: hsla(239, 100%, 67%, 1);

    background: linear-gradient(90deg, hsla(239, 100%, 67%, 1) 0%, hsla(187, 100%, 89%, 1) 100%);

    background: -moz-linear-gradient(90deg, hsla(239, 100%, 67%, 1) 0%, hsla(187, 100%, 89%, 1) 100%);

    background: -webkit-linear-gradient(90deg, hsla(239, 100%, 67%, 1) 0%, hsla(187, 100%, 89%, 1) 100%);

  }
}

.chatbot_toast_action {
  position: relative;
  display: flex;
  align-items: center;

  &:before {
    content: "|";
    color: #575757;
    margin-right: 10px;
  }

  button {
    font-size: 13px;
    font-weight: 500;

    &:hover {
      opacity: 0.6
    }
  }


}
</style>