<template>
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbLink as-child>
        <router-link to="/user/dashboard">Dashboard</router-link>
      </BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <DropdownMenu>
            <DropdownMenuTrigger class="flex items-center gap-1">
            <router-link to="/user/agents">Agents</router-link>
            </DropdownMenuTrigger>
        </DropdownMenu>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink class="font-medium text-dark"> Home </BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
</script>
