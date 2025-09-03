<script setup lang="ts">
import { BarChart } from '@components/ui/chart-bar'
import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

const mode = useColorMode()
const chartColors = computed(() => [mode.value === 'dark' ? '#fff' : '#000'])

const chartOptions = computed(() => ({
  grid: {
    left: '20px',
    right: '20px',
    top: '20px',
    bottom: '20px',
    containLabel: true
  },
  axisLabel: {
    color: mode.value === 'dark' ? '#fff' : '#000'
  },
  yAxis: {
    axisLine: {
      lineStyle: { color: mode.value === 'dark' ? '#fff' : '#000' }
    },
    splitLine: { show: false },
    axisLabel: { color: mode.value === 'dark' ? '#fff' : '#000' }
  },
  xAxis: {
    axisLine: {
      lineStyle: { color: mode.value === 'dark' ? '#fff' : '#000' }
    },
    axisLabel: { color: mode.value === 'dark' ? '#fff' : '#000' }
  }
}))
const data = [
  { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
]
</script>

<template>
  <BarChart 
    :data="data" 
    :categories="['total']" 
    :index="'name'" 
    :colors="chartColors"
    :options="chartOptions"
    :rounded-corners="4" 
  />
</template>