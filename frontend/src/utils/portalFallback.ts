import type { UserDashboardStats } from '@/api/usage'
import type {
  DashboardStats,
  ModelStat,
  TrendDataPoint,
  UserSpendingRankingItem,
  UserUsageTrendPoint
} from '@/types'

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function makeTrend(days = 7): TrendDataPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - index - 1))
    const requests = index === days - 1 ? 0 : 12 + index * 5
    const input = requests * 520
    const output = requests * 280

    return {
      date: formatLocalDate(date),
      requests,
      input_tokens: input,
      output_tokens: output,
      cache_creation_tokens: 0,
      cache_read_tokens: 0,
      total_tokens: input + output,
      cost: Number((requests * 0.0018).toFixed(4)),
      actual_cost: Number((requests * 0.0012).toFixed(4))
    }
  })
}

export function createPortalModelStats(): ModelStat[] {
  return [
    {
      model: 'qwen3-max',
      requests: 86,
      input_tokens: 43600,
      output_tokens: 21400,
      cache_creation_tokens: 0,
      cache_read_tokens: 0,
      total_tokens: 65000,
      cost: 0.156,
      actual_cost: 0.108,
      account_cost: 0.072
    },
    {
      model: 'deepseek-v4-flash',
      requests: 42,
      input_tokens: 18900,
      output_tokens: 0,
      cache_creation_tokens: 0,
      cache_read_tokens: 0,
      total_tokens: 18900,
      cost: 0.0189,
      actual_cost: 0.0126,
      account_cost: 0.0084
    }
  ]
}

export function createPortalTrend(): TrendDataPoint[] {
  return makeTrend(7)
}

export function createUserPortalStats(): UserDashboardStats {
  return {
    total_api_keys: 0,
    active_api_keys: 0,
    total_requests: 128,
    total_input_tokens: 62500,
    total_output_tokens: 21400,
    total_cache_creation_tokens: 0,
    total_cache_read_tokens: 0,
    total_tokens: 83900,
    total_cost: 0.1749,
    total_actual_cost: 0.1206,
    today_requests: 0,
    today_input_tokens: 0,
    today_output_tokens: 0,
    today_cache_creation_tokens: 0,
    today_cache_read_tokens: 0,
    today_tokens: 0,
    today_cost: 0,
    today_actual_cost: 0,
    average_duration_ms: 0,
    rpm: 0,
    tpm: 0,
    by_platform: [
      {
        platform: 'official-api',
        total_requests: 128,
        total_tokens: 83900,
        total_actual_cost: 0.1206,
        today_requests: 0,
        today_tokens: 0,
        today_actual_cost: 0
      }
    ]
  }
}

export function createAdminPortalStats(): DashboardStats {
  const now = new Date().toISOString()
  return {
    total_users: 1,
    today_new_users: 1,
    active_users: 1,
    hourly_active_users: 1,
    stats_updated_at: now,
    stats_stale: false,
    total_api_keys: 0,
    active_api_keys: 0,
    total_accounts: 2,
    normal_accounts: 2,
    error_accounts: 0,
    ratelimit_accounts: 0,
    overload_accounts: 0,
    total_requests: 128,
    total_input_tokens: 62500,
    total_output_tokens: 21400,
    total_cache_creation_tokens: 0,
    total_cache_read_tokens: 0,
    total_tokens: 83900,
    total_cost: 0.1749,
    total_actual_cost: 0.1206,
    total_account_cost: 0.0804,
    today_requests: 0,
    today_input_tokens: 0,
    today_output_tokens: 0,
    today_cache_creation_tokens: 0,
    today_cache_read_tokens: 0,
    today_tokens: 0,
    today_cost: 0,
    today_actual_cost: 0,
    today_account_cost: 0,
    average_duration_ms: 0,
    uptime: 0,
    rpm: 0,
    tpm: 0
  }
}

export function createPortalUserTrend(email: string, username: string): UserUsageTrendPoint[] {
  return makeTrend(7).map((point) => ({
    date: point.date,
    user_id: 1,
    email,
    username,
    requests: point.requests,
    tokens: point.total_tokens,
    cost: point.cost,
    actual_cost: point.actual_cost
  }))
}

export function createPortalRanking(email: string): {
  ranking: UserSpendingRankingItem[]
  total_actual_cost: number
  total_requests: number
  total_tokens: number
} {
  return {
    ranking: [
      {
        user_id: 1,
        email,
        actual_cost: 0.1206,
        requests: 128,
        tokens: 83900
      }
    ],
    total_actual_cost: 0.1206,
    total_requests: 128,
    total_tokens: 83900
  }
}
