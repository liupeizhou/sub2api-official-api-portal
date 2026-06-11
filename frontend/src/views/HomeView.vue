<template>
  <!-- Custom Home Content: Full Page Mode -->
  <div v-if="homeContent" class="min-h-screen">
    <!-- iframe mode -->
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <!-- HTML mode - SECURITY: homeContent is admin-only setting, XSS risk is acceptable -->
    <div v-else v-html="homeContent"></div>
  </div>

  <!-- Default Home Page -->
  <div v-else class="site-shell relative flex min-h-screen flex-col overflow-hidden">
    <!-- Header -->
    <header class="relative z-20 px-6 py-4">
      <nav class="mx-auto flex max-w-6xl items-center justify-between">
        <!-- Logo -->
        <div class="flex min-w-0 items-center gap-3">
          <div class="h-10 w-10 overflow-hidden rounded-lg shadow-md">
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </div>
          <span class="hidden truncate text-sm font-semibold text-gray-900 dark:text-white sm:block">
            {{ siteName }}
          </span>
        </div>

        <!-- Nav Actions -->
        <div class="flex items-center gap-3">
          <!-- Language Switcher -->
          <LocaleSwitcher />

          <!-- Doc Link -->
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-white"
            :title="t('home.viewDocs')"
          >
            <Icon name="book" size="md" />
          </a>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-white"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          >
            <Icon v-if="isDark" name="sun" size="md" />
            <Icon v-else name="moon" size="md" />
          </button>

          <!-- Login / Dashboard Button -->
          <router-link
            v-if="isAuthenticated"
            :to="dashboardPath"
            class="inline-flex items-center gap-1.5 rounded-full bg-gray-900 py-1 pl-1 pr-2.5 transition-colors hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-[10px] font-semibold text-white"
            >
              {{ userInitial }}
            </span>
            <span class="text-xs font-medium text-white">{{ t('home.dashboard') }}</span>
            <svg
              class="h-3 w-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </router-link>
          <router-link
            v-else
            to="/login"
            class="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {{ t('home.login') }}
          </router-link>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-1 px-6 py-12">
      <div class="mx-auto max-w-6xl">
        <section class="hero-section mb-12">
          <div class="hero-copy">
            <p class="hero-kicker">OFFICIAL API ROUTER</p>
            <h1>{{ siteName }}</h1>
            <p>{{ siteSubtitle }}</p>
            <div class="hero-actions">
              <router-link
                :to="isAuthenticated ? dashboardPath : '/login'"
                class="btn btn-primary px-6 py-3 text-sm shadow-lg shadow-primary-500/20"
              >
                {{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}
                <Icon name="arrowRight" size="md" class="ml-2" :stroke-width="2" />
              </router-link>
            </div>
          </div>

          <div class="gateway-console" aria-label="Gateway status">
            <div class="gateway-console__bar">
              <span>openai-compatible</span>
              <strong>/v1/chat/completions</strong>
            </div>
            <div class="gateway-console__body">
              <div class="gateway-console__line">
                <span class="code-prompt">$</span>
                <span class="code-cmd">curl</span>
                <span class="code-flag">-H</span>
                <span class="code-url">"Authorization: Bearer sk-***"</span>
              </div>
              <div class="gateway-console__line">
                <span class="code-comment">model</span>
                <span class="code-response">qwen3-max</span>
                <span class="code-comment">route</span>
                <span class="code-response">official-cn-api</span>
              </div>
              <div class="gateway-console__line">
                <span class="code-success">200 OK</span>
                <span class="code-comment">stream verified</span>
                <span class="cursor"></span>
              </div>
            </div>
          </div>
        </section>

        <div class="mb-8 grid gap-3 md:grid-cols-3">
          <div v-for="signal in gatewaySignals" :key="signal.label" class="signal-tile">
            <span>{{ signal.value }}</span>
            <strong>{{ signal.label }}</strong>
          </div>
        </div>

        <section class="pricing-section mb-12" aria-labelledby="pricing-title">
          <div class="pricing-section__head">
            <p class="pricing-section__eyebrow">Subscription Relay</p>
            <h2 id="pricing-title">把 Codex / Claude 订阅能力拆成可控 API 套餐</h2>
            <p>
              3 档本地初始套餐已按官方订阅层级对齐：入门对标 $20 级别，标准对标
              $100 级别，Pro 对标 $200 级别。
            </p>
          </div>

          <div class="plan-grid" aria-label="Subscription plans">
            <article v-for="plan in relayPlans" :key="plan.name" class="plan-card" :class="{ 'plan-card--featured': plan.featured }">
              <div class="plan-card__topline">
                <span>{{ plan.name }}</span>
                <strong>${{ plan.price }}</strong>
              </div>
              <p>{{ plan.summary }}</p>
              <div class="plan-card__match">{{ plan.match }}</div>
              <router-link
                :to="isAuthenticated ? '/purchase' : '/login?redirect=/purchase'"
                class="plan-card__action"
              >
                {{ plan.action }}
                <Icon name="arrowRight" size="sm" />
              </router-link>
            </article>
          </div>

          <div class="comparison-panel">
            <div class="comparison-panel__title">
              <span>官方订阅参照</span>
              <strong>Codex 与 Claude 档位对比</strong>
            </div>
            <div class="comparison-table-wrap">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th>本站套餐</th>
                    <th>本站价格</th>
                    <th>Codex 官方参照</th>
                    <th>Claude 官方参照</th>
                    <th>适合场景</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in subscriptionComparison" :key="row.tier">
                    <td>{{ row.tier }}</td>
                    <td>{{ row.price }}</td>
                    <td>{{ row.codex }}</td>
                    <td>{{ row.claude }}</td>
                    <td>{{ row.useCase }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="comparison-panel__note">
              官方价格会随地区、税费与套餐调整变化；本站按订阅能力等级做产品化映射。
            </div>
          </div>
        </section>

        <!-- Feature Tags -->
        <div class="mb-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <div
            class="inline-flex items-center gap-2.5 rounded-full border border-gray-200/50 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-sm dark:border-dark-700/50 dark:bg-dark-800/80"
          >
            <Icon name="swap" size="sm" class="text-primary-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-dark-200">{{
              t('home.tags.subscriptionToApi')
            }}</span>
          </div>
          <div
            class="inline-flex items-center gap-2.5 rounded-full border border-gray-200/50 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-sm dark:border-dark-700/50 dark:bg-dark-800/80"
          >
            <Icon name="shield" size="sm" class="text-primary-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-dark-200">{{
              t('home.tags.stickySession')
            }}</span>
          </div>
          <div
            class="inline-flex items-center gap-2.5 rounded-full border border-gray-200/50 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-sm dark:border-dark-700/50 dark:bg-dark-800/80"
          >
            <Icon name="chart" size="sm" class="text-primary-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-dark-200">{{
              t('home.tags.realtimeBilling')
            }}</span>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="mb-12 grid gap-4 md:grid-cols-3">
          <!-- Feature 1: Unified Gateway -->
          <div
            class="group rounded-lg border border-gray-200/50 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 dark:border-dark-700/50 dark:bg-dark-800/60"
          >
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110"
            >
              <Icon name="server" size="lg" class="text-white" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('home.features.unifiedGateway') }}
            </h3>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-dark-400">
              {{ t('home.features.unifiedGatewayDesc') }}
            </p>
          </div>

          <!-- Feature 2: Account Pool -->
          <div
            class="group rounded-lg border border-gray-200/50 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 dark:border-dark-700/50 dark:bg-dark-800/60"
          >
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-110"
            >
              <svg
                class="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('home.features.multiAccount') }}
            </h3>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-dark-400">
              {{ t('home.features.multiAccountDesc') }}
            </p>
          </div>

          <!-- Feature 3: Billing & Quota -->
          <div
            class="group rounded-lg border border-gray-200/50 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 dark:border-dark-700/50 dark:bg-dark-800/60"
          >
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 transition-transform group-hover:scale-110"
            >
              <svg
                class="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('home.features.balanceQuota') }}
            </h3>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-dark-400">
              {{ t('home.features.balanceQuotaDesc') }}
            </p>
          </div>
        </div>

        <!-- Supported China Models -->
        <section class="mb-16">
          <div class="mb-7 text-center">
            <p class="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-600 dark:text-primary-400">
              China Model Matrix
            </p>
            <h2 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('home.providers.title') }}
            </h2>
            <p class="mx-auto max-w-2xl text-sm leading-6 text-gray-600 dark:text-dark-400">
              {{ t('home.providers.description') }}
            </p>
          </div>

          <div class="model-marquee" aria-label="Supported China model providers">
            <div class="model-marquee__fade model-marquee__fade--left"></div>
            <div class="model-marquee__fade model-marquee__fade--right"></div>
            <div class="model-marquee__track">
              <div
                v-for="(provider, index) in scrollingModelProviders"
                :key="`${provider.name}-${index}`"
                class="model-provider-card"
              >
                <a
                  :href="provider.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="model-provider-card__link"
                  :title="provider.name"
                  :style="{ '--accent': provider.accent }"
                >
                  <span class="model-provider-card__icon">
                    <img
                      v-if="provider.logo && !logoLoadFailed[provider.name]"
                      :src="provider.logo"
                      :alt="`${provider.name} logo`"
                      loading="lazy"
                      referrerpolicy="no-referrer"
                      @error="markLogoFailed(provider.name)"
                    />
                    <span v-else>{{ provider.mark }}</span>
                  </span>
                  <span class="model-provider-card__body">
                    <span class="model-provider-card__name">{{ provider.name }}</span>
                    <span class="model-provider-card__models">{{ provider.models }}</span>
                  </span>
                  <span class="model-provider-card__badge">{{ provider.badge }}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-gray-200/50 px-6 py-8 dark:border-dark-800/50">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left"
      >
        <p class="text-sm text-gray-500 dark:text-dark-400">
          &copy; {{ currentYear }} {{ siteName }}. {{ t('home.footer.allRightsReserved') }}
        </p>
        <div class="flex items-center gap-4">
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-dark-400 dark:hover:text-white"
          >
            {{ t('home.docs') }}
          </a>
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-dark-400 dark:hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'

const { t } = useI18n()

const authStore = useAuthStore()
const appStore = useAppStore()

// Site settings - directly from appStore (already initialized from injected config)
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || '老刘给老孙的验证站')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const siteSubtitle = computed(
  () => appStore.cachedPublicSettings?.site_subtitle || '中国模型验证码体验与聚合演示平台'
)
const docUrl = computed(() => appStore.cachedPublicSettings?.doc_url || appStore.docUrl || '')
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')

// Check if homeContent is a URL (for iframe display)
const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

// Theme
const isDark = ref(document.documentElement.classList.contains('dark'))

// GitHub URL
const githubUrl = 'https://github.com/Wei-Shaw/sub2api'

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => isAdmin.value ? '/admin/dashboard' : '/dashboard')
const userInitial = computed(() => {
  const user = authStore.user
  if (!user || !user.email) return ''
  return user.email.charAt(0).toUpperCase()
})

const logoLoadFailed = ref<Record<string, boolean>>({})

const gatewaySignals = [
  {
    value: 'OTP',
    label: '邮箱随机码登录'
  },
  {
    value: 'CN',
    label: '中国模型路由'
  },
  {
    value: 'API',
    label: '官方接口聚合'
  }
] as const

const relayPlans = [
  {
    name: '基础版',
    price: '4.99',
    summary: '面向轻量使用与验证场景，适合日常小任务、短上下文和低频 API 调用。',
    match: '对标 $20 级别订阅能力',
    action: '选择基础版',
    featured: false
  },
  {
    name: '正常版',
    price: '19.99',
    summary: '面向稳定生产使用，适合 Codex / Claude Code 高频开发和团队内测。',
    match: '对标 $100 级别订阅能力',
    action: '选择正常版',
    featured: true
  },
  {
    name: 'Pro 版',
    price: '39.99',
    summary: '面向更重的自动化、长任务和代理工作流，预留更高的吞吐空间。',
    match: '对标 $200 级别订阅能力',
    action: '选择 Pro 版',
    featured: false
  }
] as const

const subscriptionComparison = [
  {
    tier: '基础版',
    price: '$4.99/月',
    codex: 'ChatGPT Plus：$20/月，包含 Codex 与 GPT-5.4/5.5 等模型',
    claude: 'Claude Pro：$20/月，包含 Claude Code',
    useCase: '个人验证、短任务、低频开发'
  },
  {
    tier: '正常版',
    price: '$19.99/月',
    codex: 'ChatGPT Pro 5x：$100/月起，Codex 用量约 5x Plus',
    claude: 'Claude Max 5x：$100/月，约 5x Pro 容量',
    useCase: '高频开发、连续会话、多人测试'
  },
  {
    tier: 'Pro 版',
    price: '$39.99/月',
    codex: 'ChatGPT Pro 20x：$200/月档，Codex 用量约 20x Plus',
    claude: 'Claude Max 20x：$200/月，约 20x Pro 容量',
    useCase: '重度代理、长任务、自动化流水线'
  }
] as const

const modelProviders = [
  {
    name: 'Qwen',
    mark: 'QW',
    models: 'qwen3-max / qwen-plus / qwq-plus',
    badge: '通义千问',
    url: 'https://qwen.ai/',
    logo: '',
    accent: '#615ced'
  },
  {
    name: 'DeepSeek',
    mark: 'DS',
    models: 'deepseek-chat / deepseek-reasoner',
    badge: '深度求索',
    url: 'https://www.deepseek.com/',
    logo: 'https://www.deepseek.com/favicon.ico',
    accent: '#4d6bfe'
  },
  {
    name: 'GLM',
    mark: 'GLM',
    models: 'glm-4.6 / glm-4.5 / glm-4v',
    badge: '智谱清言',
    url: 'https://chatglm.cn/',
    logo: 'https://chatglm.cn/favicon.ico',
    accent: '#2454ff'
  },
  {
    name: 'MiniMax',
    mark: 'MM',
    models: 'MiniMax-M2.7 / abab6.5-chat',
    badge: '海螺 AI',
    url: 'https://www.minimax.io/',
    logo: 'https://www.minimax.io/favicon.ico',
    accent: '#111827'
  },
  {
    name: 'StepFun',
    mark: 'SF',
    models: 'step-3.7-flash / step-2 / step-1v',
    badge: '阶跃星辰',
    url: 'https://platform.stepfun.com/',
    logo: 'https://platform.stepfun.com/favicon.svg',
    accent: '#00a4ff'
  },
  {
    name: 'Kimi',
    mark: 'K',
    models: 'moonshot-v1 / kimi-k2',
    badge: '月之暗面',
    url: 'https://kimi.moonshot.cn/',
    logo: 'https://kimi.moonshot.cn/favicon.ico',
    accent: '#6366f1'
  },
  {
    name: 'Doubao',
    mark: '豆',
    models: 'doubao-seed / doubao-pro',
    badge: '豆包',
    url: 'https://www.doubao.com/',
    logo: '',
    accent: '#0ea5e9'
  },
  {
    name: 'ERNIE',
    mark: '文',
    models: 'ernie-4.5 / ernie-x1',
    badge: '文心一言',
    url: 'https://yiyan.baidu.com/',
    logo: '',
    accent: '#2563eb'
  },
  {
    name: 'Spark',
    mark: '星',
    models: 'spark-x1 / spark-max',
    badge: '讯飞星火',
    url: 'https://xinghuo.xfyun.cn/',
    logo: 'https://xinghuo.xfyun.cn/favicon.ico',
    accent: '#e11d48'
  },
  {
    name: 'Hunyuan',
    mark: '混',
    models: 'hunyuan-turbo / hunyuan-large',
    badge: '腾讯混元',
    url: 'https://hunyuan.tencent.com/',
    logo: '',
    accent: '#0f766e'
  }
] as const

const scrollingModelProviders = computed(() => [...modelProviders, ...modelProviders])

function markLogoFailed(name: string) {
  logoLoadFailed.value = {
    ...logoLoadFailed.value,
    [name]: true
  }
}

// Current year for footer
const currentYear = computed(() => new Date().getFullYear())

// Toggle theme
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

onMounted(() => {
  initTheme()

  // Check auth state
  authStore.checkAuth()

  // Ensure public settings are loaded (will use cache if already loaded from injected config)
  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }
})
</script>

<style scoped>
.site-shell {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(241, 245, 249, 0.86)),
    linear-gradient(rgba(15, 23, 42, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.045) 1px, transparent 1px);
  background-size:
    100% 100%,
    44px 44px,
    44px 44px;
}

:global(.dark .site-shell) {
  background:
    linear-gradient(180deg, rgba(2, 6, 23, 0.94), rgba(15, 23, 42, 0.92)),
    linear-gradient(rgba(148, 163, 184, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.07) 1px, transparent 1px);
  background-size:
    100% 100%,
    44px 44px,
    44px 44px;
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 28px;
  padding: 44px 0 22px;
}

.hero-copy {
  max-width: 760px;
}

.hero-kicker {
  margin-bottom: 12px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

:global(.dark .hero-kicker) {
  color: #5eead4;
}

.hero-copy h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(38px, 7vw, 76px);
  font-weight: 850;
  line-height: 0.98;
  letter-spacing: 0;
}

:global(.dark .hero-copy h1) {
  color: #f8fafc;
}

.hero-copy p:not(.hero-kicker) {
  margin: 18px 0 0;
  max-width: 620px;
  color: #475569;
  font-size: 18px;
  line-height: 1.7;
}

:global(.dark .hero-copy p:not(.hero-kicker)) {
  color: #cbd5e1;
}

.hero-actions {
  margin-top: 28px;
}

.gateway-console {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.96);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
}

.gateway-console__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  padding: 12px 16px;
  color: #94a3b8;
  font-size: 12px;
}

.gateway-console__bar strong {
  color: #e2e8f0;
  font-family: ui-monospace, 'Fira Code', monospace;
  font-weight: 700;
}

.gateway-console__body {
  padding: 18px 20px;
  font-family: ui-monospace, 'Fira Code', monospace;
  font-size: 13px;
  line-height: 2;
}

.gateway-console__line {
  display: flex;
  min-height: 26px;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.signal-tile {
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.74);
  padding: 16px 18px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

:global(.dark .signal-tile) {
  border-color: rgba(51, 65, 85, 0.82);
  background: rgba(15, 23, 42, 0.72);
}

.signal-tile span {
  color: #0f766e;
  font-size: 24px;
  font-weight: 850;
  line-height: 1;
}

:global(.dark .signal-tile span) {
  color: #5eead4;
}

.signal-tile strong {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

:global(.dark .signal-tile strong) {
  color: #cbd5e1;
}

.pricing-section {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  padding: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
}

:global(.dark .pricing-section) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.74);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
}

.pricing-section__head {
  display: grid;
  gap: 10px;
  max-width: 780px;
}

.pricing-section__eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
}

:global(.dark .pricing-section__eyebrow) {
  color: #5eead4;
}

.pricing-section__head h2 {
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  font-weight: 850;
  line-height: 1.15;
}

:global(.dark .pricing-section__head h2) {
  color: #f8fafc;
}

.pricing-section__head p:not(.pricing-section__eyebrow) {
  margin: 0;
  color: #475569;
  font-size: 15px;
  line-height: 1.7;
}

:global(.dark .pricing-section__head p:not(.pricing-section__eyebrow)) {
  color: #cbd5e1;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.plan-card {
  display: flex;
  min-height: 210px;
  flex-direction: column;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 8px;
  background: rgba(248, 250, 252, 0.92);
  padding: 18px;
}

:global(.dark .plan-card) {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(2, 6, 23, 0.6);
}

.plan-card--featured {
  border-color: rgba(15, 118, 110, 0.42);
  background: linear-gradient(180deg, rgba(240, 253, 250, 0.98), rgba(255, 255, 255, 0.9));
  box-shadow: inset 0 0 0 1px rgba(20, 184, 166, 0.16), 0 12px 28px rgba(15, 118, 110, 0.12);
}

:global(.dark .plan-card--featured) {
  border-color: rgba(94, 234, 212, 0.38);
  background: linear-gradient(180deg, rgba(19, 78, 74, 0.5), rgba(15, 23, 42, 0.8));
}

.plan-card__topline {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.plan-card__topline span {
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

:global(.dark .plan-card__topline span) {
  color: #f8fafc;
}

.plan-card__topline strong {
  color: #0f766e;
  font-size: 30px;
  font-weight: 900;
}

:global(.dark .plan-card__topline strong) {
  color: #5eead4;
}

.plan-card p {
  margin: 14px 0 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.65;
}

:global(.dark .plan-card p) {
  color: #cbd5e1;
}

.plan-card__match {
  margin-top: auto;
  padding-top: 18px;
  color: #92400e;
  font-size: 12px;
  font-weight: 800;
}

:global(.dark .plan-card__match) {
  color: #fbbf24;
}

.plan-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  min-height: 40px;
  border-radius: 8px;
  background: #0f172a;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  transition:
    transform 160ms ease,
    background 160ms ease;
}

.plan-card__action:hover {
  background: #0f766e;
  transform: translateY(-1px);
}

.comparison-panel {
  margin-top: 16px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
}

:global(.dark .comparison-panel) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(2, 6, 23, 0.42);
}

.comparison-panel__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.1);
}

:global(.dark .comparison-panel__title) {
  border-color: rgba(148, 163, 184, 0.16);
}

.comparison-panel__title span {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.comparison-panel__title strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 850;
}

:global(.dark .comparison-panel__title strong) {
  color: #f8fafc;
}

.comparison-table-wrap {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  min-width: 840px;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 13px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  text-align: left;
  vertical-align: top;
}

:global(.dark .comparison-table th),
:global(.dark .comparison-table td) {
  border-color: rgba(148, 163, 184, 0.14);
}

.comparison-table th {
  color: #475569;
  font-size: 12px;
  font-weight: 850;
}

:global(.dark .comparison-table th) {
  color: #cbd5e1;
}

.comparison-table td {
  color: #334155;
  font-size: 13px;
  line-height: 1.55;
}

:global(.dark .comparison-table td) {
  color: #dbeafe;
}

.comparison-panel__note {
  padding: 12px 16px;
  color: #64748b;
  font-size: 12px;
}

:global(.dark .comparison-panel__note) {
  color: #94a3b8;
}

/* Terminal Container */
.terminal-container {
  position: relative;
  display: inline-block;
}

/* Terminal Window */
.terminal-window {
  width: 420px;
  background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
  border-radius: 14px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transform: perspective(1000px) rotateX(2deg) rotateY(-2deg);
  transition: transform 0.3s ease;
}

.terminal-window:hover {
  transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(-4px);
}

/* Terminal Header */
.terminal-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.terminal-buttons {
  display: flex;
  gap: 8px;
}

.terminal-buttons span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.btn-close {
  background: #ef4444;
}
.btn-minimize {
  background: #eab308;
}
.btn-maximize {
  background: #22c55e;
}

.terminal-title {
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  color: #64748b;
  margin-right: 52px;
}

/* Terminal Body */
.terminal-body {
  padding: 20px 24px;
  font-family: ui-monospace, 'Fira Code', monospace;
  font-size: 14px;
  line-height: 2;
}

.code-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  opacity: 0;
  animation: line-appear 0.5s ease forwards;
}

.line-1 {
  animation-delay: 0.3s;
}
.line-2 {
  animation-delay: 1s;
}
.line-3 {
  animation-delay: 1.8s;
}
.line-4 {
  animation-delay: 2.5s;
}

@keyframes line-appear {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.code-prompt {
  color: #22c55e;
  font-weight: bold;
}
.code-cmd {
  color: #38bdf8;
}
.code-flag {
  color: #a78bfa;
}
.code-url {
  color: #14b8a6;
}
.code-comment {
  color: #64748b;
  font-style: italic;
}
.code-success {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.code-response {
  color: #fbbf24;
}

.model-marquee {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
}

:global(.dark .model-marquee) {
  border-color: rgba(51, 65, 85, 0.72);
  background: rgba(15, 23, 42, 0.76);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
}

.model-marquee__track {
  display: flex;
  width: max-content;
  gap: 14px;
  padding: 18px;
  animation: model-marquee-scroll 38s linear infinite;
}

.model-marquee:hover .model-marquee__track {
  animation-play-state: paused;
}

.model-marquee__fade {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 96px;
  pointer-events: none;
}

.model-marquee__fade--left {
  left: 0;
  background: linear-gradient(90deg, rgba(248, 250, 252, 0.96), transparent);
}

.model-marquee__fade--right {
  right: 0;
  background: linear-gradient(270deg, rgba(248, 250, 252, 0.96), transparent);
}

:global(.dark .model-marquee__fade--left) {
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.96), transparent);
}

:global(.dark .model-marquee__fade--right) {
  background: linear-gradient(270deg, rgba(15, 23, 42, 0.96), transparent);
}

.model-provider-card {
  flex: 0 0 auto;
}

.model-provider-card__link {
  display: grid;
  grid-template-columns: 42px minmax(170px, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-width: 318px;
  min-height: 76px;
  padding: 13px 14px;
  border: 1px solid rgba(203, 213, 225, 0.64);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  color: inherit;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
}

.model-provider-card__link:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent, #14b8a6) 42%, rgba(203, 213, 225, 0.64));
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.1);
}

:global(.dark .model-provider-card__link) {
  border-color: rgba(51, 65, 85, 0.86);
  background: rgba(15, 23, 42, 0.72);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

:global(.dark .model-provider-card__link:hover) {
  border-color: color-mix(in srgb, var(--accent, #14b8a6) 52%, rgba(51, 65, 85, 0.86));
  background: rgba(30, 41, 59, 0.88);
}

.model-provider-card__icon {
  display: flex;
  height: 42px;
  width: 42px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent, #14b8a6) 88%, white), var(--accent, #14b8a6));
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  box-shadow: 0 10px 22px color-mix(in srgb, var(--accent, #14b8a6) 28%, transparent);
}

.model-provider-card__icon img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  background: #fff;
}

.model-provider-card__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.model-provider-card__name {
  font-size: 15px;
  font-weight: 750;
  line-height: 20px;
  color: #0f172a;
}

:global(.dark .model-provider-card__name) {
  color: #f8fafc;
}

.model-provider-card__models {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 18px;
  color: #64748b;
}

:global(.dark .model-provider-card__models) {
  color: #94a3b8;
}

.model-provider-card__badge {
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent, #14b8a6) 12%, white);
  padding: 4px 8px;
  color: color-mix(in srgb, var(--accent, #14b8a6) 78%, #0f172a);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

:global(.dark .model-provider-card__badge) {
  background: color-mix(in srgb, var(--accent, #14b8a6) 22%, #0f172a);
  color: color-mix(in srgb, var(--accent, #14b8a6) 56%, white);
}

@keyframes model-marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-50% - 7px));
  }
}

@media (max-width: 640px) {
  .pricing-section {
    padding: 18px;
  }

  .plan-grid {
    grid-template-columns: 1fr;
  }

  .comparison-panel__title {
    align-items: flex-start;
    flex-direction: column;
  }

  .model-marquee__fade {
    width: 48px;
  }

  .model-marquee__track {
    gap: 10px;
    padding: 12px;
    animation-duration: 30s;
  }

  .model-provider-card__link {
    grid-template-columns: 38px minmax(138px, 1fr);
    min-width: 250px;
    min-height: 70px;
    padding: 11px;
  }

  .model-provider-card__icon {
    height: 38px;
    width: 38px;
  }

  .model-provider-card__badge {
    display: none;
  }
}

/* Blinking Cursor */
.cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: #22c55e;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* Dark mode adjustments */
:global(.dark .terminal-window) {
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(20, 184, 166, 0.2),
    0 0 40px rgba(20, 184, 166, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>
