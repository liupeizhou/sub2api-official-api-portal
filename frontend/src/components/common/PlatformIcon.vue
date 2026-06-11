<template>
  <!-- GLM logo mark -->
  <svg v-if="platform === 'anthropic'" :class="sizeClass" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="7" opacity="0.16" />
    <text x="8" y="10.6" text-anchor="middle" font-size="5.2" font-weight="800">GLM</text>
  </svg>
  <!-- Qwen logo mark -->
  <svg v-else-if="platform === 'openai'" :class="sizeClass" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" opacity="0.16" />
    <text x="12" y="15.2" text-anchor="middle" font-size="7" font-weight="800">QW</text>
  </svg>
  <!-- DeepSeek logo mark -->
  <svg v-else-if="platform === 'gemini'" :class="sizeClass" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" opacity="0.16" />
    <text x="12" y="15.2" text-anchor="middle" font-size="7" font-weight="800">DS</text>
  </svg>
  <!-- MiniMax / StepFun logo mark -->
  <svg v-else-if="platform === 'antigravity'" :class="sizeClass" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" opacity="0.16" />
    <text x="12" y="15.2" text-anchor="middle" font-size="7" font-weight="800">MS</text>
  </svg>
  <!-- Fallback: generic platform icon -->
  <svg v-else :class="sizeClass" fill="currentColor" viewBox="0 0 24 24">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GroupPlatform } from '@/types'

interface Props {
  platform?: GroupPlatform
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm'
})

const sizeClass = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  return sizes[props.size] + ' flex-shrink-0'
})
</script>
