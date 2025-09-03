import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { useAuthStore } from "@/stores/auth.store";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  if (requiresAuth && !authStore.loggedIn) {
    next("/auth/login");
  } else if (requiresAdmin && authStore.user?.role !== "admin") {
    next("/user/dashboard");
  } else {
    next();
  }
});

export default router;
