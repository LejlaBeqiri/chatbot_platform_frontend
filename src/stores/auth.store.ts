import { defineStore } from 'pinia'
import type { User, AuthState, AuthResponse } from "./types/auth.types";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: null,
    user: null as User | null,
    loggedIn: false,
  }),

  actions: {
    setAuthData(data: AuthResponse["data"]) {
      this.user = data.user;
      this.loggedIn = true;
    },

    getAuthData() {
      return {
        user: this.user as User,
        loggedIn: this.loggedIn,
      }
    },

    clearAuth() {
      this.accessToken = null;
      this.user = null;
      this.loggedIn = false;
    },
  },

  persist: true,
});