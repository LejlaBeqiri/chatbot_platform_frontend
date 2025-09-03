import "vue"

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $chatbotToast: (title: string, description?: string, variant?: "default" | "destructive") => void
  }
}
