<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  title: string;
  value: string;
  trend?: string;
  subtitle?: string;
  icon: Component;
  iconBgColor?: string;
}>();
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{{ title }}</h3>
        <div class="text-3xl font-extrabold text-slate-800 tracking-tight">{{ value }}</div>
      </div>
      <div 
        class="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner"
        :class="iconBgColor || 'bg-blue-50 text-blue-600'"
      >
        <component :is="icon" class="w-6 h-6" stroke-width="2" />
      </div>
    </div>
    
    <div class="mt-4 flex items-center gap-2 text-sm">
      <span v-if="trend" class="font-semibold text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded text-xs gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        {{ trend }}
      </span>
      <span v-if="subtitle" class="text-slate-400 font-medium">{{ subtitle }}</span>
    </div>
  </div>
</template>
