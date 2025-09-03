import { defineStore } from "pinia";

export const useAppStore = defineStore("chatbotApp", {
  state: () => ({
    sidebar_is_open: false,
    page_title: "",
  }),

  actions: {
    setSidebarState(state: boolean) {
      this.sidebar_is_open = state;
    },
    toggleSidebar() {
      this.sidebar_is_open = !this.sidebar_is_open;
    },
    setPageTitle(title: string) {
      this.page_title = title;
    }
  },
  persist: true,
});
