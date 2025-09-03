import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/auth/login",
  },
  {
    path: "/auth",
    component: () => import("@layouts/AuthLayout.vue"),
    meta: { requiresAuth: false },
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("@views/auth/Login.vue"),
      },
    ],
  },
  {
    path: "/user",
    component: () => import("@layouts/UserLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@pages/dashboard/Index.vue"),
      },
      // Admin routes
      {
        path: "tenants",
        name: "admin.tenants",
        component: () => import("@pages/admin/tenants/index.vue"),
        meta: { requiresAdmin: true },
      },
      {
        path: "tenants/:id",
        name: "admin.tenants.details",
        component: () => import("@pages/admin/tenants/TenantDetails.vue"),
        meta: { requiresAdmin: true },
      },
      {
        path: "tenants/create",
        name: "admin.tenants.create",
        component: () => import("@pages/admin/tenants/CreateTenant.vue"),
        meta: { requiresAdmin: true },
      },
      {
        path: "settings",
        name: "admin.settings",
        component: () => import("@pages/admin/settings/index.vue"),
        meta: { requiresAdmin: true },
      },
      {
        path: "tenants/:id",
        name: "admin.tenants.details",
        component: () => import("@pages/admin/tenants/TenantDetails.vue"),
        meta: { requiresAdmin: true },
      },
      {
        path: "agents",
        name: "agents",
        component: () => import("@pages/agents/Index.vue"),
      },
      {
        path: "agents/create",
        name: "agents.create",
        component: () => import("@pages/agents/Create.vue"),
      },
      {
        path: "agents/:id",
        name: "agents.details",
        component: () => import("@pages/agents/AgentDetails.vue"),
      },
      {
        path: "account",
        name: "user.account",
        component: () => import("@pages/account/index.vue"),
      },
      {
        path: "widgets",
        name: "widgets.index",
        component: () => import("@pages/widgets/index.vue"),
      },
      {
        path: "knowledgeBase",
        name: "knowledgeBase.index",
        component: () => import("@pages/knowledgeBase/index.vue"),
      },
      {
        path: "knowledgeBase/create",
        name: "knowledgeBase.create",
        component: () => import("@pages/knowledgeBase/createKnowledgeBase.vue"),
      },
      {
        path: "knowledgeBase/:id",
        name: "knowledgebase.details",
        component: () =>
          import("@pages/knowledgeBase/KnowledgeBaseDetails.vue"),
      },
      {
        path: "keys",
        name: "keys.index",
        component: () => import("@pages/keys/index.vue"),
      },
      {
        path: "keys/new",
        name: "keys.create",
        component: () => import("@pages/keys/create.vue"),
      },
    ],
  },
];
