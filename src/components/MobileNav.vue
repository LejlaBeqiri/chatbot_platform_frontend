<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  GitGraph,
  Bot,
  SquareTerminal,
  WalletCards,
  ChevronRight,
  BadgeCheck,
  Sparkles,
} from "lucide-vue-next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ref } from "vue";

interface SubItem {
  title: string;
  name: string;
  icon?: typeof Sparkles;
}

interface NavItem {
  title: string;
  name: string;
  icon:
    | typeof GitGraph
    | typeof Bot
    | typeof SquareTerminal
    | typeof WalletCards
    | typeof BadgeCheck;
  items?: SubItem[];
}

const router = useRouter();
const isOpen = ref(false);
const selectedItem = ref<NavItem | null>(null);

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    name: "dashboard",
    icon: GitGraph,
  },
  {
    title: "Agents",
    name: "agents",
    icon: Bot,
    items: [
      {
        title: "View Agents",
        name: "agents",
      },
      {
        title: "Create Agent",
        name: "agents.create",
      }
    ],
  },
  {
    title: "Playground",
    name: "playground",
    icon: SquareTerminal,
    items: [
      {
        title: "Test your agent",
        name: "playground",
      },
    ],
  },
  {
    title: "Account",
    name: "user.account",
    icon: BadgeCheck,
    items: [
      {
        title: "Account",
        name: "user.account",
        icon: BadgeCheck,
      },
    ],
  },
];

const handleNavClick = (item: NavItem): void => {
  if (item.items) {
    selectedItem.value = item;
    isOpen.value = true;
  } else {
    router.push({ name: item.name });
  }
};

const handleSubItemClick = (subItem: SubItem): void => {
  if (subItem.name) {
    router.push({ name: subItem.name });
    isOpen.value = false;
  }
};
</script>

<template>
<nav class="fixed bottom-0 left-0 z-50 h-16 w-full border-t bg-background md:hidden">
  <div class="mx-auto flex h-full max-w-lg justify-evenly">
    <button
      v-for="item in navItems"
      :key="item.name"
      @click="handleNavClick(item)"
      class="group flex-1 flex flex-col items-center justify-center px-2 min-w-0"
      type="button"
    >
      <component
        :is="item.icon"
        class="mb-1 h-5 w-5 text-muted-foreground group-hover:text-primary"
      />
      <span class="text-xs text-muted-foreground group-hover:text-primary truncate">
        {{ item.title }}
      </span>
    </button>
  </div>
</nav>


  <!-- Bottom Sheet for Sub-items -->
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="bottom"
      class="max-h-[85vh] overflow-y-auto"
      :style="{
        '--sheet-height': 'auto',
        'min-height': '200px',
      }"
    >
      <SheetHeader class="sticky top-0 bg-background z-10 pb-4">
        <SheetTitle class="flex items-center gap-2">
          <component :is="selectedItem?.icon" class="h-5 w-5" />
          {{ selectedItem?.title }}
        </SheetTitle>
      </SheetHeader>
      <div class="space-y-1">
        <div
          v-for="subItem in selectedItem?.items"
          :key="subItem.name"
          @click="handleSubItemClick(subItem)"
          class="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 hover:bg-muted"
        >
          <div class="flex items-center gap-2">
            <component
              v-if="subItem.icon"
              :is="subItem.icon"
              class="h-4 w-4 text-muted-foreground"
            />
            <span>{{ subItem.title }}</span>
          </div>
          <ChevronRight class="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
