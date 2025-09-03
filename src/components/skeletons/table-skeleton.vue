<script lang="ts" setup>
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="space-y-6">
   
    
    <!-- Table Skeleton -->
    <div class=" rounded-lg space-y-3">
      
      
      <div class="space-y-4">
        <!-- Table Headers -->
        <div class="grid grid-cols-5 gap-4">
          <Skeleton class="h-8 w-20" />
          <Skeleton class="h-8 w-20" />
          <Skeleton class="h-8 w-20" />
          <Skeleton class="h-8 w-24" />
          <Skeleton class="h-8 w-24" />
        </div>
        
        <!-- Table Rows -->
        <div v-for="i in 5" :key="i" class="grid grid-cols-5 gap-4 items-center">
          <Skeleton class="h-8 w-40" />
          <Skeleton class="h-8 w-40" />
          <Skeleton class="h-8 w-40" />
          <Skeleton class="h-8 w-40" />
          <Skeleton class="h-8 w-10 " />
        </div>
      </div>
    </div>
  </div>
</template>
