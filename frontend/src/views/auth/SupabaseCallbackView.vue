<template>
  <AuthLayout>
    <div class="space-y-4 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
        <svg
          class="h-5 w-5 animate-spin text-primary-600 dark:text-primary-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Completing sign in</h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-dark-400">
          Please wait while we verify your email session.
        </p>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AuthLayout } from '@/components/layout'
import { useAppStore, useAuthStore } from '@/stores'
import { completeSupabaseRedirectSession } from '@/api/supabaseAuth'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const session = await completeSupabaseRedirectSession()
    if (!session) {
      throw new Error('No Supabase session was found in this callback.')
    }

    await authStore.setSupabaseSession(session)
    appStore.showSuccess('Email sign in completed.')
    await router.replace('/dashboard')
  } catch (error) {
    console.error('Supabase auth callback failed:', error)
    appStore.showError((error as { message?: string }).message || 'Email sign in failed.')
    await router.replace('/login')
  }
})
</script>
