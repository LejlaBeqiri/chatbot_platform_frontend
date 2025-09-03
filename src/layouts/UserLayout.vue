<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RouterView } from "vue-router";
import { useRouter } from "vue-router";
import { useColorMode } from "@vueuse/core";
import { ref, watch, onMounted, computed } from "vue";
import { useAppStore } from "@/stores/app.store";
import PageTitle from "@/components/PageTitle.vue";
const mode = useColorMode();
const router = useRouter();
const appStore = useAppStore();
const openSubmenus = ref<string[]>([]);

// Watch sidebar state changes
watch(
  () => appStore.sidebar_is_open,
  (sidebar_is_open) => {
    if (!sidebar_is_open) {
      // Close all submenus when sidebar collapses
      openSubmenus.value = [];
    }
  }
);

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  GitGraph,
  BadgeCheck,
  Bot,
  ChevronRight,
  LogOut,
  KeyRound,
  ChevronDown,
  Book,
  Users,
} from "lucide-vue-next";

import { useAuthStore } from "@/stores/auth.store";
import { AuthService } from "@/services";
import MobileNav from "@/components/MobileNav.vue";
const authStore = useAuthStore();
onMounted(() => {
  mode.value = 'light'
})
// This is sample data.
interface NavItem {
  title: string;
  name: string;
  icon: any;
  isActive?: boolean;
  to?: string;
  items?: SubNavItem[];
}

interface SubNavItem {
  title: string;
  name?: string;
  url?: string;
}

interface ProfileNavItem {
  name: string;
  RouteName?: string;
  icon: any;
  items?: ProfileSubItem[];
}

interface ProfileSubItem {
  name: string;
  RouteName?: string;
  icon: any;
}


interface UserData {
  name: string;
  email: string;
  avatar: string;
}

interface AppData {
  user: UserData;
  navMain: NavItem[];
  profile_nav: ProfileNavItem[];
}

const data: AppData = {
  user: {
    name: authStore.user?.first_name || '',
    email: authStore.user?.email || "",
    avatar: authStore.user?.last_name || '',
  },
  navMain: [
    {
      title: "Dashboard",
      name: "dashboard",
      isActive: true,
      icon: GitGraph,
    },    // Admin only menus
    ...(authStore.user?.role === "admin" ? [
      {
        title: "Tenants",
        name: "admin.tenants",
        icon: Users,
        to: "/admin/tenants"
      }
    ] : []),
    {
      title: "View Agents",
      name: "agents",
      isActive: false,
      icon: Bot,
    },
    {
      title: "Knowledge Base",
      name: "knowledgeBase.index",
      icon: Book,
    },
    ...(authStore.user?.role !== 'admin' ? [
      {
        title: "Api Keys",
        name: "keys.index",
        icon: KeyRound,
      }
    ] : [])
  ] as NavItem[],
  profile_nav: [
    {
      name: "Account",
      RouteName: "user.account",
      icon: BadgeCheck,
    }
  ] as ProfileNavItem[],
};


const userInitials = computed(() => {
  if (!authStore.user) return '';
  if (authStore.user.role === 'admin') return 'A';

  const initials = [
    authStore.user.first_name?.charAt(0) || '',
    authStore.user.last_name?.charAt(0) || ''
  ].filter(Boolean).join('');

  return initials.toUpperCase() || 'U';
});

const handleLogout = async () => {
  try {
    await AuthService.logout();
    router.push("/auth/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <!-- <SidebarGroupLabel>Platform</SidebarGroupLabel> -->
          <SidebarMenu>
            <template v-for="item in data.navMain" :key="item.title">
              <!-- Non-collapsible items (like Dashboard) -->
              <SidebarMenuItem v-if="!('items' in item)">
                <SidebarMenuButton :tooltip="item.title" as-child>
                  <RouterLink :to="{ name: item.name }">
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <!-- Collapsible items -->
              <Collapsible v-else as-child :default-open="item.isActive"
                :open="appStore.sidebar_is_open && openSubmenus.includes(item.title)" @update:open="(open) => {
                  if (open) {
                    openSubmenus = [...openSubmenus, item.title];
                  } else {
                    openSubmenus = openSubmenus.filter(
                      (t) => t !== item.title
                    );
                  }
                }" class="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton :tooltip="item.title">
                      <component :is="item.icon" />
                      <span>{{ item.title }}</span>
                      <ChevronRight
                        class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <template v-if="'items' in item">
                        <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                          <SidebarMenuSubButton as-child>
                            <RouterLink v-if="'name' in subItem" :to="{ name: subItem.name }">
                              <span>{{ subItem.title }}</span>
                            </RouterLink>
                            <a v-else :href="subItem.url">
                              <span>{{ subItem.title }}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </template>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </template>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>

        <SidebarMenu>
          <SidebarMenuItem> </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>

    <SidebarInset class="bg-muted/40">
      <header class="flex justify-between h-12 shrink-0 items-center gap-2 px-4 bg-muted/40">
        <div>
          <PageTitle />

        </div>
        <div class="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar class="h-8 w-8 rounded-lg bg-gray-200">
                  <AvatarImage :src="data.user.avatar" :alt="data.user.name" />
                  <AvatarFallback class="rounded-lg">{{ userInitials }}</AvatarFallback>
                </Avatar>

                <ChevronDown class="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="bottom"
              align="end" :side-offset="4">
              <DropdownMenuLabel class="p-0 font-normal">
                <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarImage :src="data.user.avatar" :alt="data.user.name" />
                    <AvatarFallback class="rounded-lg">{{ userInitials }}</AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{
                      data.user.name
                    }}</span>
                    <span class="truncate text-xs">{{ data.user.email }}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup v-for="item in data.profile_nav" :key="item.name" class="group/collapsible">
                <DropdownMenuItem v-if="!('items' in item)" @click="
                  item.RouteName
                    ? router.push({ name: item.RouteName })
                    : null
                  ">
                  <component :is="item.icon" />
                  {{ item.name }}
                </DropdownMenuItem>

                <template v-else>
                  <DropdownMenuItem class="font-medium">
                    <component :is="item.icon" />
                    {{ item.name }}
                  </DropdownMenuItem>
                  <template v-if="'items' in item && item.items">
                    <DropdownMenuItem v-for="subItem in item.items" :key="subItem.name" @click="
                      subItem.RouteName
                        ? router.push({ name: subItem.RouteName })
                        : null
                      " class="pl-8">
                      <component :is="subItem.icon" />
                      {{ subItem.name }}
                    </DropdownMenuItem>
                  </template>
                </template>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="handleLogout">
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div class="bg-muted/40  px-8  py-4">
        <RouterView />
      </div>
    </SidebarInset>
    <MobileNav />
  </SidebarProvider>
</template>

<style scoped>
/* Style for active links within the sidebar */
a.router-link-exact-active {
  @apply bg-black rounded-md;
  /* Apply background to the link itself */
}

a.router-link-exact-active span,
a.router-link-exact-active svg {
  @apply text-white font-semibold;
  /* Style the text and icon */
}
</style>
